# Tasks — fix-nav-pill-context-and-chat-scroll

## 1. Pill de navegación

- [x] 1.1 Condicionar las clases del nav sobre `isInicio`: Inicio = transparente + borde hairline sin sombra; resto = estilo vigente + `.lrmq-nav-pill` solo en esa rama
- [x] 1.2 Actualizar comentario del override dark en `index.css`

## 2. Chat sin bloqueo de scroll

- [x] 2.1 Eliminar el efecto `body.style.overflow='hidden'` de `ChatPanel`
- [x] 2.2 Actualizar el test de accesibilidad al contrato sin lock

## 3. Validación y entrega

- [x] 3.1 Suite, lint, typecheck y build en verde
- [x] 3.2 Capturas Playwright {light,dark} × {Inicio, sección sin foto} + prueba funcional de scroll con chat abierto
- [x] 3.3 Informe breve en `docs/audit/` y commit+push
