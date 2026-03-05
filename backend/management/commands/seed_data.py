from datetime import timedelta
from decimal import Decimal
import random

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.audit.models import AuditLog
from apps.core.models.base import SystemSetting
from apps.customers.models import Customer, Employment, Guarantor
from apps.loans.models import LoanApplication, Loan, Collateral
from apps.repayments.models import Repayment, RepaymentSchedule, Penalty
from apps.mpesa.models import MpesaPayment, MpesaTransaction, MpesaCallback
from apps.notifications.models import Template, Notification, SMSLog
from apps.users.models import User


SEED_DOMAIN = "seed.superlegit.local"
SEED_MARK = "[SEEDED]"


class Command(BaseCommand):
    help = "Populate sample data across Super Legit Advance backend models."

    def add_arguments(self, parser):
        parser.add_argument("--customers", type=int, default=10)
        parser.add_argument("--seed", type=int, default=42)
        parser.add_argument("--reset", action="store_true")

    @transaction.atomic
    def handle(self, *args, **opts):
        random.seed(opts["seed"])
        n = max(1, opts["customers"])
        if opts["reset"]:
            self._reset()

        users = self._users()
        self._settings()
        templates = self._templates(users["admin"])
        customers = self._customers(n, users["officer"])
        apps, loans = self._loans(customers, users)
        repayments = self._repayments(loans, users["officer"])
        self._mpesa(repayments)
        self._notifications(customers, templates, users["admin"])
        self._audit(users, loans, repayments)
        self.stdout.write(self.style.SUCCESS(f"Seeded customers={len(customers)} loans={len(loans)} repayments={len(repayments)}"))

    def _reset(self):
        Notification.objects.filter(title__startswith=SEED_MARK).delete()
        Template.objects.filter(name__startswith=f"{SEED_MARK} ").delete()
        AuditLog.objects.filter(module="seed_data").delete()
        MpesaCallback.objects.filter(processing_notes__startswith=SEED_MARK).delete()
        MpesaTransaction.objects.filter(transaction_id__startswith="SEED-TXN-").delete()
        MpesaPayment.objects.filter(payment_reference__startswith="SEED-MPESA-").delete()
        Penalty.objects.filter(notes__startswith=SEED_MARK).delete()
        RepaymentSchedule.objects.filter(notes__startswith=SEED_MARK).delete()
        Repayment.objects.filter(notes__startswith=SEED_MARK).delete()
        Collateral.objects.filter(notes__startswith=SEED_MARK).delete()
        Loan.objects.filter(notes__startswith=SEED_MARK).delete()
        LoanApplication.objects.filter(notes__startswith=SEED_MARK).delete()
        Guarantor.objects.filter(notes__startswith=SEED_MARK).delete()
        Employment.objects.filter(notes__startswith=SEED_MARK).delete()
        Customer.objects.filter(notes__startswith=SEED_MARK).delete()
        SystemSetting.objects.filter(key__startswith="seed_data.").delete()
        User.objects.filter(email__iendswith=f"@{SEED_DOMAIN}").delete()

    def _users(self):
        specs = [
            ("admin", "System", "Admin", "+254700000001", "admin"),
            ("manager", "Grace", "Manager", "+254700000002", "staff"),
            ("officer", "David", "Officer", "+254700000003", "staff"),
            ("collector", "Ruth", "Collector", "+254700000004", "staff"),
        ]
        out = {}
        for slug, first, last, phone, role in specs:
            email = f"{slug}@{SEED_DOMAIN}"
            user = User.objects.filter(email=email).first()
            if not user:
                user = User.objects.create_user(
                    email=email,
                    phone_number=phone,
                    password="Password123!",
                    first_name=first,
                    last_name=last,
                    role=role,
                    status="active",
                    is_staff=True,
                    is_active=True,
                    is_verified=True,
                    email_verified=True,
                    phone_verified=True,
                    terms_accepted=True,
                    privacy_policy_accepted=True,
                )
            else:
                user.first_name = first
                user.last_name = last
                user.role = role
                user.status = "active"
                user.is_staff = True
                user.is_active = True
                user.is_verified = True
                user.email_verified = True
                user.phone_verified = True
                user.terms_accepted = True
                user.privacy_policy_accepted = True
                if not user.phone_number:
                    user.phone_number = phone
                if not user.has_usable_password():
                    user.set_password("Password123!")
                user.save()
            out[slug] = user
        return out

    def _settings(self):
        for key, value, dtype in [
            ("seed_data.sample_mode", "true", "boolean"),
            ("seed_data.generated_at", timezone.now().isoformat(), "string"),
        ]:
            SystemSetting.objects.update_or_create(
                key=key,
                defaults={"value": value, "data_type": dtype, "category": "seed_data", "description": "Auto seeded"},
            )

    def _templates(self, admin):
        rows = [
            ("Loan Approval SMS", "SMS", "LOAN", "Hello {{name}}, loan {{loan_number}} approved."),
            ("Repayment Reminder SMS", "SMS", "PAYMENT", "Reminder: repayment due {{due_date}}."),
            ("Collection Alert Email", "EMAIL", "ALERT", "Account {{customer_number}} overdue."),
        ]
        out = []
        for name, ttype, cat, content in rows:
            tpl, _ = Template.objects.get_or_create(
                name=f"{SEED_MARK} {name}",
                defaults={
                    "template_type": ttype,
                    "category": cat,
                    "language": "EN",
                    "subject": f"{SEED_MARK} {name}" if ttype == "EMAIL" else "",
                    "content": content,
                    "sample_data": {"name": "Sample", "loan_number": "LN-SEED"},
                    "created_by": admin,
                    "updated_by": admin,
                },
            )
            out.append(tpl)
        return out

    def _customers(self, n, officer):
        out = []
        counties = ["Nairobi", "Kiambu", "Nakuru", "Kisumu", "Mombasa"]
        for i in range(1, n + 1):
            c, _ = Customer.objects.get_or_create(
                id_number=f"{30000000+i:08d}",
                defaults={
                    "first_name": f"Borrower{i}",
                    "last_name": "Seed",
                    "date_of_birth": timezone.now().date() - timedelta(days=365 * (22 + i % 10)),
                    "gender": "M" if i % 2 else "F",
                    "marital_status": "SINGLE",
                    "id_type": "NATIONAL_ID",
                    "phone_number": f"+2547{20000000+i:08d}",
                    "email": f"borrower{i}@{SEED_DOMAIN}",
                    "physical_address": f"{SEED_MARK} Estate {i}",
                    "county": counties[i % len(counties)],
                    "sub_county": "Central",
                    "status": "ACTIVE",
                    "credit_score": Decimal("620.00"),
                    "risk_level": "MEDIUM",
                    "notes": f"{SEED_MARK} customer",
                    "created_by": officer,
                    "updated_by": officer,
                },
            )
            Employment.objects.get_or_create(
                customer=c,
                defaults={
                    "employment_type": "EMPLOYED",
                    "sector": "PRIVATE",
                    "occupation": "Trader",
                    "employer_name": f"Seed Co {i}",
                    "monthly_income": Decimal("55000.00"),
                    "other_income": Decimal("5000.00"),
                    "date_employed": timezone.now().date() - timedelta(days=365 * 3),
                    "is_verified": True,
                    "verification_method": "PHONE",
                    "notes": f"{SEED_MARK} employment",
                    "created_by": officer,
                    "updated_by": officer,
                },
            )
            if i <= max(3, n // 2):
                Guarantor.objects.get_or_create(
                    customer=c,
                    id_number=f"{40000000+i:08d}",
                    defaults={
                        "first_name": f"Guarantor{i}",
                        "last_name": "Seed",
                        "phone_number": f"+2547{40000000+i:08d}",
                        "physical_address": f"{SEED_MARK} Address",
                        "county": counties[(i + 1) % len(counties)],
                        "id_type": "NATIONAL_ID",
                        "relationship": "FRIEND",
                        "occupation": "Business",
                        "monthly_income": Decimal("90000.00"),
                        "verification_status": "VERIFIED",
                        "notes": f"{SEED_MARK} guarantor",
                        "created_by": officer,
                        "updated_by": officer,
                    },
                )
            out.append(c)
        return out

    def _loans(self, customers, users):
        apps, loans = [], []
        for i, c in enumerate(customers, start=1):
            req = Decimal(str(30000 + i * 5000))
            app, _ = LoanApplication.objects.get_or_create(
                customer=c,
                purpose_description=f"{SEED_MARK} application {i}",
                defaults={
                    "loan_type": "PERSONAL",
                    "amount_requested": req,
                    "term_months": 6 + (i % 6),
                    "purpose": "Business boost",
                    "monthly_income": Decimal("55000.00"),
                    "total_monthly_expenses": Decimal("25000.00"),
                    "status": "APPROVED",
                    "approved_amount": (req * Decimal("0.9")).quantize(Decimal("0.01")),
                    "approved_interest_rate": Decimal("14.00"),
                    "approved_by": users["manager"],
                    "approval_date": timezone.now() - timedelta(days=i),
                    "notes": f"{SEED_MARK} application",
                    "created_by": users["officer"],
                    "updated_by": users["manager"],
                },
            )
            apps.append(app)
            status = ["ACTIVE", "APPROVED", "OVERDUE", "COMPLETED"][i % 4]
            start = timezone.now().date() - timedelta(days=30 * (1 + i % 5))
            loan, _ = Loan.objects.get_or_create(
                customer=c,
                notes=f"{SEED_MARK} loan {i}",
                defaults={
                    "loan_type": "PERSONAL",
                    "purpose": "OTHER",
                    "purpose_description": f"{SEED_MARK} purpose",
                    "amount_requested": req,
                    "amount_approved": (req * Decimal("0.9")).quantize(Decimal("0.01")),
                    "amount_disbursed": (req * Decimal("0.9")).quantize(Decimal("0.01")) if status != "APPROVED" else Decimal("0.00"),
                    "term_months": 6 + (i % 6),
                    "interest_rate": Decimal("14.00"),
                    "status": status,
                    "start_date": start,
                    "maturity_date": start + timedelta(days=30 * (6 + i % 6)),
                    "total_interest": (req * Decimal("0.16")).quantize(Decimal("0.01")),
                    "total_amount_due": (req * Decimal("1.16")).quantize(Decimal("0.01")),
                    "outstanding_balance": (req * Decimal("1.16")).quantize(Decimal("0.01")),
                    "installment_amount": ((req * Decimal("1.16")) / Decimal(6 + i % 6)).quantize(Decimal("0.01")),
                    "approved_by": users["manager"],
                    "disbursed_by": users["officer"],
                    "created_by": users["officer"],
                    "updated_by": users["officer"],
                },
            )
            if status == "COMPLETED":
                loan.amount_paid = loan.total_amount_due
                loan.outstanding_balance = Decimal("0.00")
                loan.completion_date = timezone.now().date() - timedelta(days=5)
                loan.save(update_fields=["amount_paid", "outstanding_balance", "completion_date", "updated_at"])
            if i % 2 == 0:
                Collateral.objects.get_or_create(
                    loan=loan,
                    description=f"{SEED_MARK} Vehicle {i}",
                    defaults={
                        "collateral_type": "VEHICLE",
                        "owner_name": c.full_name,
                        "owner_id_number": c.id_number,
                        "ownership_type": "SOLE",
                        "estimated_value": Decimal("350000.00"),
                        "location": f"{c.county} yard",
                        "status": "ACTIVE",
                        "notes": f"{SEED_MARK} collateral",
                        "created_by": users["officer"],
                        "updated_by": users["officer"],
                    },
                )
            if app.loan_id != loan.id:
                app.loan = loan
                app.save(update_fields=["loan", "updated_at"])
            loans.append(loan)
        return apps, loans

    def _repayments(self, loans, officer):
        out = []
        for i, loan in enumerate(loans, start=1):
            due = (loan.start_date or timezone.now().date()) + timedelta(days=30)
            inst = loan.installment_amount or Decimal("10000.00")
            RepaymentSchedule.objects.get_or_create(
                loan=loan,
                installment_number=1,
                defaults={
                    "customer": loan.customer,
                    "due_date": due,
                    "principal_amount": (inst * Decimal("0.8")).quantize(Decimal("0.01")),
                    "interest_amount": (inst * Decimal("0.2")).quantize(Decimal("0.01")),
                    "total_amount": inst,
                    "amount_paid": Decimal("0.00"),
                    "amount_outstanding": inst,
                    "status": "PENDING",
                    "notes": f"{SEED_MARK} schedule",
                    "created_by": officer,
                    "updated_by": officer,
                },
            )
            paid = inst if loan.status in ["ACTIVE", "COMPLETED"] else Decimal("0.00")
            rep = Repayment.objects.filter(notes=f"{SEED_MARK} repayment {i}", loan=loan).first()
            if not rep:
                rep = Repayment(
                    repayment_number=f"SEED-RPY-{timezone.now().strftime('%Y%m')}-{i:06d}",
                    loan=loan,
                    customer=loan.customer,
                    amount_due=inst,
                    amount_paid=paid,
                    amount_outstanding=(inst - paid).quantize(Decimal("0.01")),
                    principal_amount=(inst * Decimal("0.8")).quantize(Decimal("0.01")),
                    interest_amount=(inst * Decimal("0.2")).quantize(Decimal("0.01")),
                    payment_method="MPESA",
                    status="COMPLETED" if paid > 0 else ("OVERDUE" if loan.status == "OVERDUE" else "PENDING"),
                    due_date=due,
                    payment_date=timezone.now() - timedelta(days=1) if paid > 0 else None,
                    payment_reference=f"SEED-REP-{i:05d}",
                    transaction_id=f"SEED-TX-{i:05d}",
                    collected_by=officer,
                    created_by=officer,
                    updated_by=officer,
                    notes=f"{SEED_MARK} repayment {i}",
                )
                Repayment.objects.bulk_create([rep])
                rep = Repayment.objects.get(repayment_number=rep.repayment_number)
            out.append(rep)
            if loan.status == "OVERDUE":
                Penalty.objects.get_or_create(
                    loan=loan,
                    customer=loan.customer,
                    notes=f"{SEED_MARK} penalty",
                    defaults={
                        "repayment": rep,
                        "penalty_type": "LATE_PAYMENT",
                        "amount": Decimal("1200.00"),
                        "reason": f"{SEED_MARK} overdue",
                        "status": "APPLIED",
                        "due_date": timezone.now().date() + timedelta(days=14),
                        "amount_paid": Decimal("0.00"),
                        "amount_outstanding": Decimal("1200.00"),
                        "applied_by": officer,
                        "created_by": officer,
                        "updated_by": officer,
                    },
                )
        return out

    def _mpesa(self, repayments):
        for i, rep in enumerate([r for r in repayments if r.amount_paid > 0], start=1):
            pay, _ = MpesaPayment.objects.get_or_create(
                payment_reference=f"SEED-MPESA-{i:05d}",
                defaults={
                    "customer": rep.customer,
                    "loan": rep.loan,
                    "repayment": rep,
                    "phone_number": rep.customer.phone_number,
                    "amount": rep.amount_paid,
                    "description": f"{SEED_MARK} mpesa payment",
                    "status": "SUCCESSFUL",
                    "merchant_request_id": f"SEED-MRID-{i:05d}",
                    "checkout_request_id": f"SEED-CRID-{i:05d}",
                    "result_code": 0,
                },
            )
            MpesaTransaction.objects.get_or_create(
                payment=pay,
                defaults={
                    "transaction_id": f"SEED-TXN-{i:05d}",
                    "mpesa_receipt_number": f"SEEDRCP{i:05d}",
                    "amount": pay.amount,
                    "phone_number": pay.phone_number,
                    "transaction_date": timezone.now() - timedelta(minutes=i),
                    "status": "COMPLETED",
                    "raw_response": {"seed": True},
                },
            )
            MpesaCallback.objects.get_or_create(
                payment=pay,
                callback_type="STK_PUSH",
                callback_data={"Body": {"stkCallback": {"ResultCode": 0, "ResultDesc": "Success"}}},
                defaults={"is_processed": True, "processed_at": timezone.now(), "processing_notes": f"{SEED_MARK} callback"},
            )

    def _notifications(self, customers, templates, admin):
        for i, c in enumerate(customers[:8], start=1):
            n, _ = Notification.objects.get_or_create(
                title=f"{SEED_MARK} Notice {i}",
                recipient_name=c.full_name,
                recipient_phone=c.phone_number,
                defaults={
                    "notification_type": "PAYMENT_REMINDER",
                    "channel": "SMS",
                    "priority": "MEDIUM",
                    "message": f"{SEED_MARK} Dear {c.first_name}, reminder.",
                    "recipient": c.user,
                    "recipient_email": c.email or "",
                    "sender": admin,
                    "status": "SENT",
                    "template": templates[i % len(templates)],
                    "sent_at": timezone.now() - timedelta(minutes=i),
                    "cost": Decimal("0.80"),
                    "created_by": admin,
                    "updated_by": admin,
                },
            )
            SMSLog.objects.get_or_create(
                notification=n,
                defaults={
                    "phone_number": n.recipient_phone,
                    "message": n.message,
                    "message_id": f"SEEDSMS{i:05d}",
                    "status": "DELIVERED",
                    "sent_at": n.sent_at,
                    "delivered_at": timezone.now() - timedelta(minutes=max(0, i - 1)),
                    "cost": Decimal("0.80"),
                    "created_by": admin,
                    "updated_by": admin,
                },
            )

    def _audit(self, users, loans, repayments):
        rows = [
            ("LOGIN", users["admin"], "Auth"),
            ("CREATE", users["officer"], "Customer"),
            ("APPROVE", users["manager"], "LoanApplication"),
            ("PAYMENT", users["collector"], "Repayment"),
            ("REPORT", users["manager"], "Report"),
        ]
        for i, (action, user, model) in enumerate(rows, start=1):
            AuditLog.objects.create(
                action=action,
                status="SUCCESS",
                severity="INFO",
                user=user,
                model_name=model,
                object_id=str(loans[0].id) if loans else "",
                changes={"seed": True, "index": i},
                request_method="POST",
                request_path="/management/commands/seed_data",
                response_status=201,
                module="seed_data",
                feature="seed",
                user_ip=f"127.0.0.{i}",
                user_agent="seed_data_command",
                timestamp=timezone.now() - timedelta(minutes=i),
            )
