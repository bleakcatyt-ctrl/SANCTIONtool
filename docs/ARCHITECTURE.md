# Cipher: целевая production-архитектура

## Компоненты

- **Web/PWA:** React, TypeScript, Web Crypto, IndexedDB; приватные ключи хранятся только локально и защищаются платформенным keystore, где это возможно.
- **API:** NestJS, REST/OpenAPI; управление пользователями, серверами, ролями, приглашениями и устройствами.
- **Realtime gateway:** WebSocket + Redis Streams/pub-sub; передаёт только ciphertext и метаданные доставки.
- **Data:** PostgreSQL для метаданных и зашифрованных конвертов, Redis для presence/rate limits, S3/MinIO для зашифрованных вложений.
- **Calls:** P2P WebRTC для 1:1; mediasoup SFU для групп. DTLS-SRTP защищает транспорт, Insertable Streams/SFrame нужны для E2EE через SFU.

## Модель шифрования

1. При регистрации устройства клиент генерирует identity key, signed prekey и пакет one-time prekeys.
2. Сервер принимает только публичный prekey bundle. Сессия 1:1 устанавливается через аудитированную реализацию Signal/X3DH + Double Ratchet.
3. Группы используют Sender Keys или MLS. Изменение состава группы инициирует смену эпохи/ключей.
4. Вложения шифруются случайным AES-256-GCM ключом до загрузки. Ключ, nonce, digest и MIME передаются внутри E2EE-конверта сообщения.
5. Каждое устройство независимо участвует в сессии. Отзыв устройства удаляет его prekeys и инициирует ротацию групповых ключей.
6. Safety numbers/QR позволяют пользователям обнаружить подмену identity key. Изменение identity key не должно приниматься молча.

## Границы доверия

Сервер видит аккаунты, членство, время доставки, размеры ciphertext, IP и данные abuse-report, но не plaintext. Поиск выполняется локально. Серверная модерация plaintext несовместима с строгим E2EE; жалоба должна явно отправлять выбранный пользователем расшифрованный материал.

## Защита платформы

- Argon2id для паролей, короткоживущие access tokens, rotating refresh tokens в Secure/HttpOnly/SameSite cookies.
- TOTP/WebAuthn, single-use recovery codes, журнал сессий и отзыв устройств.
- TLS 1.3, HSTS, CSP без `unsafe-inline`, CSRF protection, schema validation, parameterized queries.
- Rate limits по аккаунту/IP/действию, очереди загрузки, лимиты размера и malware scanning только зашифрованных/добровольно раскрытых данных.
- Audit logs без секретов и plaintext; secrets в KMS/Vault; зашифрованные backup и проверяемое восстановление.

## Этапы выпуска

1. Threat model и прототип клиента; выбрать поддерживаемую реализацию libsignal/MLS.
2. Устройства, prekeys, 1:1 сообщения и тестовые векторы.
3. Группы, ротация, вложения, multi-device и recovery UX.
4. WebRTC/SFU E2EE, OAuth/TOTP/WebAuthn, permissions и abuse workflow.
5. Независимый криптографический аудит, pentest, load/chaos tests и staged rollout.

UI в `apps/web` является демонстрацией продукта, а не завершённой реализацией этой архитектуры.