## 1. Pruebas primero
- [x] 1.1 `finanzas.nomina-pagada.integration.test.ts` (3 casos): AUTORIZADA a PAGADA con publicación y republicación en reentrega; otro proyecto o no AUTORIZADA sin efectos; PATCH /pagar 409.
- [x] 1.2 Pruebas existentes ajustadas al flujo nuevo.

## 2. Implementar
- [x] 2.1 `handleNominaPagadaFinanzasEvent`, `publicarNominaPagada`, cola con reintento y DLQ.
- [x] 2.2 `PATCH /prenominas/:id/pagar` → 409.
- [x] 2.3 CI: generate, db push y prueba de Personal.

## 3. Verificar
- [x] 3.1 `tsc` del servicio y de la prueba.
- [ ] 3.2 CI en verde.
