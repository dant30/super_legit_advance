## Summary
- What changed:
- Why:

## Scope
- [ ] Frontend
- [ ] Backend
- [ ] Infrastructure (`render.yaml`, CI/CD)
- [ ] Documentation

## Validation
- [ ] `frontend`: `npm run lint`
- [ ] `frontend`: `npm run build`
- [ ] `frontend`: tests (if affected)
- [ ] `backend`: `python manage.py check --env=development`
- [ ] `backend`: migrations reviewed (`makemigrations --check --dry-run`)

## Database / API impact
- [ ] No DB schema changes
- [ ] DB schema changes included
- [ ] API contract unchanged
- [ ] API contract changed (documented below)

### API contract changes (if any)
- Endpoint(s):
- Request/response change:
- Frontend compatibility:

## Deployment notes
- Render services impacted:
- Required environment variables:
- Rollback plan:

## Checklist
- [ ] I verified there are no hardcoded secrets
- [ ] I updated docs/examples where needed
- [ ] I kept changes focused and minimal
