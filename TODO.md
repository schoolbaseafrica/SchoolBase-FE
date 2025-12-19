# TODO: Remove Database Configuration from Setup Wizard

## Tasks
- [ ] Update setup-wizard.tsx: Remove database step, adjust step numbers, remove database API call
- [ ] Update progress-indicator.tsx: Remove database step, adjust labels
- [ ] Update welcome-screen.tsx: Remove database step from installation steps list
- [ ] Update installation-progress.tsx: Remove database creation step
- [ ] Update use-restore-form.ts: Remove database check in calculateStep function
- [ ] Update types/setup.ts: Remove DatabaseConfig interface and from FormData
- [ ] Update school-info.tsx: Change ProgressIndicator currentStep from 2 to 1
- [ ] Update create-super-admin.tsx: Change ProgressIndicator currentStep from 3 to 2
