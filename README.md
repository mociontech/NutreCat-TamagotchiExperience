# 🐱 NUTRE CAT: EL GATO CAMPEÓN

Experiencia interactiva tipo Tamagotchi para totem touch, inspirada en el Mundial de fútbol y Colombia.

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abre http://localhost:5173

## Flujo de pantallas

1. **Attract Loop** → pantalla de atracción con estadio y gato dormido
2. **Wake Screen** → toca la patita para despertar a Simón
3. **Pet Screen** → desliza para acariciarlo y llenar la barra de cariño
4. **Dashboard** → hub principal con 4 acciones y stats del gato
5. **Feed Select** → elige entre Dry Food, Wet Food o Treats
6. **Feed Interaction** → arrastra el plato hasta el gato con drag & drop
7. **Football Game** → toca rápido para cargar potencia, luego patea
8. **Goal Celebration** → ¡Gol por Colombia! marcador + confetti
9. **Care Screen** → mantén presionado para cepillar al gato
10. **Talk Screen** → elige frases y el gato responde con burbujas
11. **Champion Result** → stats al 100%, badge "Vínculo Inquebrantable"
12. **Reward QR** → código QR con 10% OFF en Nutre Cat
13. **Share Postcard** → postal compartible con score final

## Reemplazar assets reales

Todos los assets van en `/public/assets/`. Busca los comentarios `// REPLACE:` en el código:

| Archivo esperado | Componente |
|---|---|
| `nutre-cat-logo.png` | `NutreCatLogo.tsx` |
| `nutre-cat-pack-dry.png` | `ProductCard.tsx` |
| `nutre-cat-pack-wet.png` | `ProductCard.tsx` |
| `nutre-cat-pack-treats.png` | `ProductCard.tsx` |
| `orange-cat-idle.png` | `CatCharacter.tsx` |
| `orange-cat-happy.png` | `CatCharacter.tsx` |
| `orange-cat-eating.png` | `FeedInteractionScreen.tsx` |
| `orange-cat-playing.png` | `FootballGameScreen.tsx` |
| `orange-cat-care.png` | `CareScreen.tsx` |
| `colombia-ball.png` | `AttractLoop.tsx` |

## Estado del gato (gameStates.ts)

```ts
energy: number        // ⚡ sube con alimentar y cuidar
hunger: number        // 🍗 baja al alimentar
affection: number     // 💕 sube con todo
mood: number          // 😺 sube al hablar
mundialSpirit: number // ⚽ sube al jugar
score: number         // puntos del mini juego
```

## Resolución objetivo

Diseñado para **1080×1920px** (9:16 vertical totem).
También funciona responsive en móvil y desktop.

## Tech stack

- React 18 + TypeScript
- Vite
- Framer Motion (animaciones y transiciones)
- CSS puro con variables (sin dependencias CSS adicionales)
