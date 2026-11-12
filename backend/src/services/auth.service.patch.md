# Patch Instructions for auth.service.ts

## 1. Add to imports
```ts
import { registerWithVerification, activateAccount, requestPasswordReset, resetPasswordWithToken, recordLoginAttempt } from './auth.service.fixes';
```

## 2. Replace `register` body
```ts
async register(input: RegisterInput) {
  const result = await registerWithVerification(input);
  return { user: toSafeUser(result.user) };
}
```

## 3. Replace `activate`
```ts
async activate(token: string) {
  await activateAccount(token);
}
```

## 4. Replace `forgotPassword`
```ts
async forgotPassword(email: string) {
  await requestPasswordReset(email);
}
```

## 5. Replace `resetPassword`
```ts
async resetPassword(token: string, newPassword: string) {
  await resetPasswordWithToken(token, newPassword);
}
```

## 6. Add to `login` success/fail paths
```ts
// on failure:
await recordLoginAttempt(user.id, false, { ip: meta.ip, ua: meta.ua, reason: 'INVALID_CREDENTIALS' });
throw invalid;

// on success:
await recordLoginAttempt(user.id, true, { ip: meta.ip, ua: meta.ua });
```
