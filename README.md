# NutreCat Play

Experiencia interactiva para totem touch en formato vertical 9:16. El usuario registra el nombre del gato, lo consiente, completa actividades de comida/juego/sueno y llega a una pantalla final con QR promocional.

## Comandos

```bash
npm install
npm run dev
npm run build
```

En local, Vite suele levantar en `http://localhost:5173`.

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

```bash
VITE_DATAHUB_TOKEN=
VITE_DATAHUB_EVENT_ID=
VITE_DATAHUB_URL=
VITE_EXPERIENCE_NAME=
VITE_DATAHUB_EXPERIENCE_ID=
```

No subir `.env` al repositorio.

## Estructura principal

```text
src/
  App.tsx                    Flujo central de pantallas
  data/gameStates.ts         Tipos y estado inicial del gato
  utils/datahub.ts           Envio de datos a Datahub
  utils/sounds.ts            Mapa y helpers de audio
  screens/
    start/                   Pantalla inicial
    onboarding/              Registro del nombre
    pet/                     Consentir al gato
    hub/                     Hub de actividades
    feed/                    Seleccion e interaccion de comida
    games/
      penalty/               Juego de penalties
      catch/                 Juego Atrapalo
    sleep/                   Pantalla de dormir
    reward/                  Pantalla final con QR
```

## Flujo de pantallas

1. `StartScreen`
2. `RegistrationScreen`
3. `PettingScreen`
4. `HubScreen`
5. Actividad de comida: `FeedSelectScreen` -> `FeedInteractionScreen`
6. Juego de penalties: `PenaltyInstructionsScreen` -> `PenaltyGameScreen` -> `PenaltyResultsScreen`
7. Juego Atrapalo: `CatchBenefitsScreen` -> `CatchInstructionsScreen` -> `CatchCountdownScreen` -> `CatchGameScreen`
8. Dormir: `SleepScreen`
9. Final: `FinalRewardScreen`

## Assets

Los assets publicos viven en `public/assets` y los sonidos en `public/sounds`.

Videos principales del gato:

```text
public/assets/cat/Animation/
```

Assets de la pantalla final:

```text
public/assets/reward/
```

QR promocional:

```text
public/assets/backgrounds/QR.png
```

## Datos enviados

La integracion con Datahub se dispara al entrar a la pantalla final, cuando comida, juego y dormir ya estan completados. El payload incluye datos basicos de sesion, duracion, nombre del gato, comida elegida, juego elegido, puntaje total, puntaje del juego y resumen de actividades.
