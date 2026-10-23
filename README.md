# Volunteam App

## Setting up the fake API (json-server)

Update the file `src/services/api.ts`.

Before running your 'json-server', get your computer's IP address and update your baseURL to `http://your_ip_address_here:3333` and then run:

```
npx json-server --watch db.json --port 3333 --host your_ip_address_here -m ./node_modules/json-server-auth
```

To access your server online without running json-server locally, you can set your baseURL to:

```
https://my-json-server.typicode.com/<your-github-username>/<your-github-repo>
```

To use `my-json-server`, make sure your `db.json` is located at the repo root.

## Setting up the image upload API

Update the file `src/services/imageApi.ts`.

You can use any hosting service of your preference. In this case, we will use ImgBB API: https://api.imgbb.com/.
Sign up for free at https://imgbb.com/signup, get your API key and add it to the .env file in your root folder.

To run the app in your local environment, you will need to set the IMGBB_API_KEY when starting the app using:

```
IMGBB_API_KEY="insert_your_api_key_here" npx expo start
```

When creating your app build or publishing, import your secret values to EAS running:

```
eas secret:push
```

## Part 2 — Event Details (how to run and test)

### Running

1. Start the fake API (leave it running):
   ```
   npx json-server --watch db.json --port 3333 --host 0.0.0.0 -m ./node_modules/json-server-auth
   ```
2. Point the app at it in `src/services/api.ts`:
   - On a **real phone**, set your computer's IP address.
   - On the **Android emulator**, `10.0.2.2` is used automatically.
3. Start the app with `npx expo start`.

**Note on Expo SDK 47 (this starter):**
- The app-store Expo Go no longer supports SDK 47.
- The old SDK 47 Expo Go can't load Google Maps any more, because its built-in key was revoked.
- To see the map, use a **development build** with your own key. It was tested on an Android 13 emulator:
  ```
  # PowerShell — key from Google Cloud with "Maps SDK for Android" enabled
  $env:GOOGLE_MAPS_API_KEY="your_key"
  npm run build:android        # builds and installs the dev build
  npm run start:dev-build      # starts Metro for the dev build
  ```
- The key is read from an environment variable in `app.config.ts`, so it is never committed.

### Test users

All sample users have the password `123456`.

| User | Sees |
|---|---|
| `ulla.ulriksen@example.com` | Volunteered (blue) on Skating Lessons and Kids Programming; Downtown Vibe is full (grey) |
| `elif.aksit@example.com` | Skating Lessons is open (orange); the other two events are full |

### What was implemented

- **Map:**
  - Loads events from the API and hides past events.
  - Fits the user's location and all events on load and whenever you return to the map.
  - Marker colour and the footer count reflect each event's status.
- **Marker tap:** opens **Event Details**, passing the event through route params.
- **Status box:**
  - "Volunteered" if you applied
  - "X of Y Volunteer(s) needed" if the event is open
  - "Team is full" if the event is full
- **Buttons:**
  - **Call / Text** (organizer's phone): only for events you applied to
  - **Volunteer:** only for open events you haven't applied to
  - **Share:** for open events and events you applied to
  - **Show routes:** always shown
- **Reusable components:** `InfoBox`, `EventStatusBox`, `ScreenHeader`.
- **Event status logic:** lives in one place, `src/utils/eventStatus.ts`.
- **Sample data:** the three sample events in `db.json` were moved to 2027 so they are upcoming. The 2022 event stays to show that past events are hidden.

### Known starter-code issues (not part of this task)

- `validateEmail` only accepts 3-letter top-level domains, so `luigi@carluccio.it` and `john@silva.com.br` can't log in.
- The "+" (create event) button is a placeholder for a later part of the project.
