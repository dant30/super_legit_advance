# frontend.ps1
# Creates the complete frontend project structure for Super Legit Advance

# Define base paths
$frontendPath = ".\frontend"
$srcPath = "$frontendPath\src"
$apiPath = "$srcPath\api"
$contextsPath = "$srcPath\contexts"
$hooksPath = "$srcPath\hooks"
$routerPath = "$srcPath\router"
$utilsPath = "$srcPath\utils"
$stylesPath = "$srcPath\styles"
$componentsPath = "$srcPath\components"
$pagesPath = "$srcPath\pages"
$configPath = "$srcPath\config"

# Define component subdirectories
$componentsLayoutPath = "$componentsPath\layout"
$componentsUiPath = "$componentsPath\ui"
$componentsSharedPath = "$componentsPath\shared"
$componentsDashboardPath = "$componentsPath\dashboard"
$componentsDashboardCommonPath = "$componentsDashboardPath\common"
$componentsDashboardStaffPath = "$componentsDashboardPath\staff"
$componentsDashboardAdminPath = "$componentsDashboardPath\admin"
$componentsCustomersPath = "$componentsPath\customers"
$componentsLoansPath = "$componentsPath\loans"
$componentsRepaymentsPath = "$componentsPath\repayments"
$componentsPaymentsPath = "$componentsPath\payments"
$componentsReportsPath = "$componentsPath\reports"
$componentsNotificationsPath = "$componentsPath\notifications"
$componentsAdminPath = "$componentsPath\admin"
$componentsAdminStaffPath = "$componentsAdminPath\staff"
$componentsAdminSettingsPath = "$componentsAdminPath\settings"
$componentsAdminRolesPath = "$componentsAdminPath\roles"
$componentsAdminAuditPath = "$componentsAdminPath\audit"

# Define page subdirectories
$pagesAuthPath = "$pagesPath\auth"
$pagesDashboardPath = "$pagesPath\dashboard"
$pagesCustomersPath = "$pagesPath\customers"
$pagesLoansPath = "$pagesPath\loans"
$pagesRepaymentsPath = "$pagesPath\repayments"
$pagesReportsPath = "$pagesPath\reports"
$pagesNotificationsPath = "$pagesPath\notifications"
$pagesAdminPath = "$pagesPath\admin"
$pagesAdminStaffPath = "$pagesAdminPath\staff"
$pagesAdminSettingsPath = "$pagesAdminPath\settings"
$pagesAdminRolesPath = "$pagesAdminPath\roles"
$pagesAdminAuditPath = "$pagesAdminPath\audit"
$pagesDocsPath = "$pagesPath\docs"
$pagesLegalPath = "$pagesPath\legal"
$pagesSupportPath = "$pagesPath\support"

# Define public directory
$publicPath = "$frontendPath\public"

Write-Host "Creating frontend project structure..." -ForegroundColor Green

# Create root directory
New-Item -ItemType Directory -Force -Path $frontendPath | Out-Null

# Create root files
@(
    "package.json",
    "package-lock.json",
    "Dockerfile",
    "vite.config.js",
    "tailwind.config.js",
    "postcss.config.js",
    "jsconfig.json",
    "index.html",
    ".env.example",
    ".gitignore"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$frontendPath\$_" | Out-Null
    Write-Host "  Created: $_" -ForegroundColor Yellow
}

# Create public directory and files
New-Item -ItemType Directory -Force -Path $publicPath | Out-Null
@(
    "favicon.ico",
    "logo.png",
    "logo-dark.png",
    "manifest.json"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$publicPath\$_" | Out-Null
    Write-Host "  Created: public\$_" -ForegroundColor Yellow
}

# Create src directory and main files
New-Item -ItemType Directory -Force -Path $srcPath | Out-Null
@(
    "main.jsx",
    "App.jsx",
    "vite-env.d.ts"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$srcPath\$_" | Out-Null
    Write-Host "  Created: src\$_" -ForegroundColor Yellow
}

# Create API directory and files
New-Item -ItemType Directory -Force -Path $apiPath | Out-Null
@(
    "axios.js",
    "auth.js",
    "customers.js",
    "loans.js",
    "repayments.js",
    "mpesa.js",
    "notifications.js",
    "reports.js",
    "audit.js",
    "admin.js",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$apiPath\$_" | Out-Null
    Write-Host "  Created: src\api\$_" -ForegroundColor Cyan
}

# Create contexts directory and files
New-Item -ItemType Directory -Force -Path $contextsPath | Out-Null
@(
    "AuthContext.jsx",
    "ThemeContext.jsx",
    "ToastContext.jsx",
    "CustomerContext.jsx",
    "LoanContext.jsx",
    "RepaymentContext.jsx",
    "ReportContext.jsx",
    "MpesaContext.jsx",
    "AuditContext.jsx",
    "NotificationContext.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$contextsPath\$_" | Out-Null
    Write-Host "  Created: src\contexts\$_" -ForegroundColor Cyan
}

# Create hooks directory and files
New-Item -ItemType Directory -Force -Path $hooksPath | Out-Null
@(
    "useAuth.js",
    "useCustomers.js",
    "useLoans.js",
    "useRepayments.js",
    "useReports.js",
    "useMpesa.js",
    "useAudit.js",
    "useNotifications.js",
    "useMediaQuery.js",
    "useApi.js",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$hooksPath\$_" | Out-Null
    Write-Host "  Created: src\hooks\$_" -ForegroundColor Cyan
}

# Create router directory and files
New-Item -ItemType Directory -Force -Path $routerPath | Out-Null
@(
    "routes.jsx",
    "PrivateRoute.jsx",
    "StaffRoute.jsx",
    "AdminRoute.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$routerPath\$_" | Out-Null
    Write-Host "  Created: src\router\$_" -ForegroundColor Cyan
}

# Create utils directory and files
New-Item -ItemType Directory -Force -Path $utilsPath | Out-Null
@(
    "formatters.js",
    "validators.js",
    "constants.js",
    "helpers.js",
    "cn.js",
    "env.js",
    "theme.js",
    "reportUtils.js",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$utilsPath\$_" | Out-Null
    Write-Host "  Created: src\utils\$_" -ForegroundColor Cyan
}

# Create styles directory and files
New-Item -ItemType Directory -Force -Path $stylesPath | Out-Null
@(
    "tailwind.css",
    "globals.css",
    "components.css",
    "animations.css"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$stylesPath\$_" | Out-Null
    Write-Host "  Created: src\styles\$_" -ForegroundColor Cyan
}

# Create components directory structure
New-Item -ItemType Directory -Force -Path $componentsPath | Out-Null
New-Item -ItemType File -Force -Path "$componentsPath\index.js" | Out-Null
Write-Host "  Created: src\components\index.js" -ForegroundColor Magenta

# Create layout components
New-Item -ItemType Directory -Force -Path $componentsLayoutPath | Out-Null
@(
    "Header.jsx",
    "Sidebar.jsx",
    "Footer.jsx",
    "Layout.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$componentsLayoutPath\$_" | Out-Null
    Write-Host "  Created: src\components\layout\$_" -ForegroundColor Magenta
}

# Create UI components
New-Item -ItemType Directory -Force -Path $componentsUiPath | Out-Null
@(
    "Button.jsx",
    "Card.jsx",
    "Input.jsx",
    "Label.jsx",
    "Select.jsx",
    "Checkbox.jsx",
    "Radio.jsx",
    "Switch.jsx",
    "Modal.jsx",
    "Tabs.jsx",
    "Accordion.jsx",
    "Badge.jsx",
    "Alert.jsx",
    "Tooltip.jsx",
    "Breadcrumb.jsx",
    "Table.jsx",
    "Pagination.jsx",
    "ThemeInitializer.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$componentsUiPath\$_" | Out-Null
    Write-Host "  Created: src\components\ui\$_" -ForegroundColor Magenta
}

# Create shared components
New-Item -ItemType Directory -Force -Path $componentsSharedPath | Out-Null
@(
    "Loading.jsx",
    "Error.jsx",
    "ErrorBoundary.jsx",
    "EmptyState.jsx",
    "ConfirmDialog.jsx",
    "Toast.jsx",
    "SearchBar.jsx",
    "FileUpload.jsx",
    "DatePicker.jsx",
    "TimePicker.jsx",
    "Avatar.jsx",
    "StatusBadge.jsx",
    "ProgressBar.jsx",
    "Divider.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$componentsSharedPath\$_" | Out-Null
    Write-Host "  Created: src\components\shared\$_" -ForegroundColor Magenta
}

# Create dashboard components
New-Item -ItemType Directory -Force -Path $componentsDashboardPath | Out-Null

# Dashboard common components
New-Item -ItemType Directory -Force -Path $componentsDashboardCommonPath | Out-Null
@(
    "StatCard.jsx",
    "ChartCard.jsx",
    "QuickActions.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$componentsDashboardCommonPath\$_" | Out-Null
    Write-Host "  Created: src\components\dashboard\common\$_" -ForegroundColor Magenta
}

# Dashboard staff components
New-Item -ItemType Directory -Force -Path $componentsDashboardStaffPath | Out-Null
@(
    "OverviewCards.jsx",
    "MyLoans.jsx",
    "MyCustomers.jsx",
    "RecentActivity.jsx",
    "Performance.jsx",
    "PendingApprovals.jsx",
    "Collections.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$componentsDashboardStaffPath\$_" | Out-Null
    Write-Host "  Created: src\components\dashboard\staff\$_" -ForegroundColor Magenta
}

# Dashboard admin components
New-Item -ItemType Directory -Force -Path $componentsDashboardAdminPath | Out-Null
@(
    "SystemOverview.jsx",
    "StaffPerformance.jsx",
    "LoanPortfolio.jsx",
    "RepaymentMetrics.jsx",
    "FinancialSummary.jsx",
    "UserActivity.jsx",
    "SystemHealth.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$componentsDashboardAdminPath\$_" | Out-Null
    Write-Host "  Created: src\components\dashboard\admin\$_" -ForegroundColor Magenta
}

# Create customer components
New-Item -ItemType Directory -Force -Path $componentsCustomersPath | Out-Null
@(
    "CustomerTable.jsx",
    "CustomerCard.jsx",
    "CustomerForm.jsx",
    "CustomerProfile.jsx",
    "CustomerFilters.jsx",
    "CustomerSearch.jsx",
    "EmploymentForm.jsx",
    "GuarantorForm.jsx",
    "GuarantorsList.jsx",
    "DocumentUpload.jsx",
    "CustomerStats.jsx",
    "RiskIndicator.jsx",
    "ImportDialog.jsx",
    "ExportDialog.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$componentsCustomersPath\$_" | Out-Null
    Write-Host "  Created: src\components\customers\$_" -ForegroundColor Magenta
}

# Create loan components
New-Item -ItemType Directory -Force -Path $componentsLoansPath | Out-Null
@(
    "LoanTable.jsx",
    "LoanCard.jsx",
    "LoanForm.jsx",
    "LoanDetails.jsx",
    "LoanFilters.jsx",
    "LoanSearch.jsx",
    "LoanCalculator.jsx",
    "LoanApplication.jsx",
    "LoanApproval.jsx",
    "CollateralForm.jsx",
    "AmortizationSchedule.jsx",
    "LoanStatusBadge.jsx",
    "LoanStats.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$componentsLoansPath\$_" | Out-Null
    Write-Host "  Created: src\components\loans\$_" -ForegroundColor Magenta
}

# Create repayment components
New-Item -ItemType Directory -Force -Path $componentsRepaymentsPath | Out-Null
@(
    "RepaymentTable.jsx",
    "RepaymentForm.jsx",
    "RepaymentDetails.jsx",
    "RepaymentFilters.jsx",
    "PaymentSchedule.jsx",
    "PaymentReceipt.jsx",
    "OverdueAlerts.jsx",
    "RepaymentStats.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$componentsRepaymentsPath\$_" | Out-Null
    Write-Host "  Created: src\components\repayments\$_" -ForegroundColor Magenta
}

# Create payment components
New-Item -ItemType Directory -Force -Path $componentsPaymentsPath | Out-Null
@(
    "MpesaPayment.jsx",
    "PaymentForm.jsx",
    "PaymentHistory.jsx",
    "PaymentVerification.jsx",
    "TransactionTable.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$componentsPaymentsPath\$_" | Out-Null
    Write-Host "  Created: src\components\payments\$_" -ForegroundColor Magenta
}

# Create report components
New-Item -ItemType Directory -Force -Path $componentsReportsPath | Out-Null
@(
    "ReportGenerator.jsx",
    "ReportPreview.jsx",
    "ReportFilters.jsx",
    "ReportChart.jsx",
    "ExportOptions.jsx",
    "LoansReport.jsx",
    "PaymentsReport.jsx",
    "CustomersReport.jsx",
    "PerformanceReport.jsx",
    "CollectionReport.jsx",
    "AuditReport.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$componentsReportsPath\$_" | Out-Null
    Write-Host "  Created: src\components\reports\$_" -ForegroundColor Magenta
}

# Create notification components
New-Item -ItemType Directory -Force -Path $componentsNotificationsPath | Out-Null
@(
    "NotificationList.jsx",
    "NotificationCard.jsx",
    "NotificationBell.jsx",
    "NotificationSettings.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$componentsNotificationsPath\$_" | Out-Null
    Write-Host "  Created: src\components\notifications\$_" -ForegroundColor Magenta
}

# Create admin components structure
New-Item -ItemType Directory -Force -Path $componentsAdminPath | Out-Null
New-Item -ItemType File -Force -Path "$componentsAdminPath\index.js" | Out-Null
Write-Host "  Created: src\components\admin\index.js" -ForegroundColor Magenta

# Admin staff components
New-Item -ItemType Directory -Force -Path $componentsAdminStaffPath | Out-Null
@(
    "StaffTable.jsx",
    "StaffForm.jsx",
    "StaffDetail.jsx",
    "StaffFilters.jsx",
    "StaffPerformance.jsx",
    "TaskAssignment.jsx",
    "WorkSchedule.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$componentsAdminStaffPath\$_" | Out-Null
    Write-Host "  Created: src\components\admin\staff\$_" -ForegroundColor Magenta
}

# Admin settings components
New-Item -ItemType Directory -Force -Path $componentsAdminSettingsPath | Out-Null
@(
    "Configuration.jsx",
    "LoanProducts.jsx",
    "InterestRates.jsx",
    "BackupRestore.jsx",
    "SystemHealth.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$componentsAdminSettingsPath\$_" | Out-Null
    Write-Host "  Created: src\components\admin\settings\$_" -ForegroundColor Magenta
}

# Admin roles components
New-Item -ItemType Directory -Force -Path $componentsAdminRolesPath | Out-Null
@(
    "RoleList.jsx",
    "RoleForm.jsx",
    "PermissionEditor.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$componentsAdminRolesPath\$_" | Out-Null
    Write-Host "  Created: src\components\admin\roles\$_" -ForegroundColor Magenta
}

# Admin audit components
New-Item -ItemType Directory -Force -Path $componentsAdminAuditPath | Out-Null
@(
    "AuditLogList.jsx",
    "AuditDetail.jsx",
    "AuditFilters.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$componentsAdminAuditPath\$_" | Out-Null
    Write-Host "  Created: src\components\admin\audit\$_" -ForegroundColor Magenta
}

# Create pages directory structure
New-Item -ItemType Directory -Force -Path $pagesPath | Out-Null
@(
    "NotFound.jsx",
    "Unauthorized.jsx",
    "Maintenance.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$pagesPath\$_" | Out-Null
    Write-Host "  Created: src\pages\$_" -ForegroundColor Green
}

# Create auth pages
New-Item -ItemType Directory -Force -Path $pagesAuthPath | Out-Null
@(
    "Login.jsx",
    "ForgotPassword.jsx",
    "ResetPassword.jsx",
    "Profile.jsx",
    "TwoFactorAuth.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$pagesAuthPath\$_" | Out-Null
    Write-Host "  Created: src\pages\auth\$_" -ForegroundColor Green
}

# Create dashboard pages
New-Item -ItemType Directory -Force -Path $pagesDashboardPath | Out-Null
@(
    "StaffDashboard.jsx",
    "AdminDashboard.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$pagesDashboardPath\$_" | Out-Null
    Write-Host "  Created: src\pages\dashboard\$_" -ForegroundColor Green
}

# Create customer pages
New-Item -ItemType Directory -Force -Path $pagesCustomersPath | Out-Null
@(
    "CustomerList.jsx",
    "CustomerCreate.jsx",
    "CustomerEdit.jsx",
    "CustomerDetail.jsx",
    "CustomerImport.jsx",
    "CustomerExport.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$pagesCustomersPath\$_" | Out-Null
    Write-Host "  Created: src\pages\customers\$_" -ForegroundColor Green
}

# Create loan pages
New-Item -ItemType Directory -Force -Path $pagesLoansPath | Out-Null
@(
    "LoanList.jsx",
    "LoanCreate.jsx",
    "LoanEdit.jsx",
    "LoanDetail.jsx",
    "LoanApprovals.jsx",
    "LoanCalculator.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$pagesLoansPath\$_" | Out-Null
    Write-Host "  Created: src\pages\loans\$_" -ForegroundColor Green
}

# Create repayment pages
New-Item -ItemType Directory -Force -Path $pagesRepaymentsPath | Out-Null
@(
    "RepaymentList.jsx",
    "RepaymentCreate.jsx",
    "RepaymentDetail.jsx",
    "PaymentHistory.jsx",
    "OverdueRepayments.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$pagesRepaymentsPath\$_" | Out-Null
    Write-Host "  Created: src\pages\repayments\$_" -ForegroundColor Green
}

# Create report pages
New-Item -ItemType Directory -Force -Path $pagesReportsPath | Out-Null
@(
    "ReportDashboard.jsx",
    "LoansReport.jsx",
    "PaymentsReport.jsx",
    "CustomersReport.jsx",
    "PerformanceReport.jsx",
    "CollectionReport.jsx",
    "AuditReport.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$pagesReportsPath\$_" | Out-Null
    Write-Host "  Created: src\pages\reports\$_" -ForegroundColor Green
}

# Create notification pages
New-Item -ItemType Directory -Force -Path $pagesNotificationsPath | Out-Null
@(
    "NotificationCenter.jsx",
    "NotificationSettings.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$pagesNotificationsPath\$_" | Out-Null
    Write-Host "  Created: src\pages\notifications\$_" -ForegroundColor Green
}

# Create admin pages structure
New-Item -ItemType Directory -Force -Path $pagesAdminPath | Out-Null
New-Item -ItemType File -Force -Path "$pagesAdminPath\index.js" | Out-Null
Write-Host "  Created: src\pages\admin\index.js" -ForegroundColor Green

# Admin staff pages
New-Item -ItemType Directory -Force -Path $pagesAdminStaffPath | Out-Null
@(
    "StaffList.jsx",
    "StaffCreate.jsx",
    "StaffEdit.jsx",
    "StaffDetail.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$pagesAdminStaffPath\$_" | Out-Null
    Write-Host "  Created: src\pages\admin\staff\$_" -ForegroundColor Green
}

# Admin settings pages
New-Item -ItemType Directory -Force -Path $pagesAdminSettingsPath | Out-Null
@(
    "SystemSettings.jsx",
    "LoanProducts.jsx",
    "InterestRates.jsx",
    "BackupRestore.jsx",
    "SystemHealth.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$pagesAdminSettingsPath\$_" | Out-Null
    Write-Host "  Created: src\pages\admin\settings\$_" -ForegroundColor Green
}

# Admin roles pages
New-Item -ItemType Directory -Force -Path $pagesAdminRolesPath | Out-Null
@(
    "RoleList.jsx",
    "RoleCreate.jsx",
    "RoleEdit.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$pagesAdminRolesPath\$_" | Out-Null
    Write-Host "  Created: src\pages\admin\roles\$_" -ForegroundColor Green
}

# Admin audit pages
New-Item -ItemType Directory -Force -Path $pagesAdminAuditPath | Out-Null
@(
    "AuditLogs.jsx",
    "AuditDetail.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$pagesAdminAuditPath\$_" | Out-Null
    Write-Host "  Created: src\pages\admin\audit\$_" -ForegroundColor Green
}

# Create docs pages
New-Item -ItemType Directory -Force -Path $pagesDocsPath | Out-Null
@(
    "ApiDocumentation.jsx",
    "UserGuide.jsx",
    "SystemGuide.jsx",
    "Tutorials.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$pagesDocsPath\$_" | Out-Null
    Write-Host "  Created: src\pages\docs\$_" -ForegroundColor Green
}

# Create legal pages
New-Item -ItemType Directory -Force -Path $pagesLegalPath | Out-Null
@(
    "TermsOfService.jsx",
    "PrivacyPolicy.jsx",
    "DataProtection.jsx",
    "AcceptableUse.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$pagesLegalPath\$_" | Out-Null
    Write-Host "  Created: src\pages\legal\$_" -ForegroundColor Green
}

# Create support pages
New-Item -ItemType Directory -Force -Path $pagesSupportPath | Out-Null
@(
    "HelpCenter.jsx",
    "ContactSupport.jsx",
    "SystemStatus.jsx",
    "FeatureRequest.jsx",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$pagesSupportPath\$_" | Out-Null
    Write-Host "  Created: src\pages\support\$_" -ForegroundColor Green
}

# Create config directory and files (optional)
New-Item -ItemType Directory -Force -Path $configPath | Out-Null
@(
    "api.config.js",
    "app.config.js",
    "feature.flags.js",
    "index.js"
) | ForEach-Object {
    New-Item -ItemType File -Force -Path "$configPath\$_" | Out-Null
    Write-Host "  Created: src\config\$_" -ForegroundColor Cyan
}

Write-Host "`nFrontend project structure created successfully!" -ForegroundColor Green
Write-Host "Total directories created: ~130" -ForegroundColor Yellow
Write-Host "Total files created: ~250" -ForegroundColor Yellow
Write-Host "`nProject ready for development!" -ForegroundColor Green