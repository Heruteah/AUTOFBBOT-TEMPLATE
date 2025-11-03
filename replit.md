# Overview

This is an automated Facebook Messenger bot built with Node.js that uses the `biar-fca` library to interact with Facebook's messaging platform. The bot features a plugin-based command system, automatic event handling, scheduled tasks, and a web interface for bot management and user authentication.

The bot automatically restarts on certain exit codes, loads commands and event handlers dynamically from the `script` directory, and provides features like AI chat integration, image generation, music downloads, and automated posting.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Command & Event System
**Problem**: Need a scalable way to add new bot commands and event handlers without modifying core code.

**Solution**: Plugin-based architecture where commands and events are loaded dynamically from the `script` directory. Each script exports a `config` object and either a `run` function (for commands) or `handleEvent` function (for events).

**Rationale**: This modular approach allows for easy extensibility - new features can be added by simply dropping new files into the script folder. Commands are stored in a Map structure for O(1) lookup performance.

## Process Management
**Problem**: Bot needs to stay online and recover from crashes automatically.

**Solution**: Two-layer process architecture with `index.js` as a watchdog process that spawns `main.js`. Exit code 1 triggers automatic restart.

**Rationale**: Separating the watchdog from the main bot process provides resilience. The bot can intentionally exit with code 1 to trigger a clean restart without manual intervention.

## Role-Based Access Control
**Problem**: Different commands need different permission levels.

**Solution**: Role system (0 = user, 2 = admin) defined in command configs, with admin UIDs stored in `data/config.json`.

**Rationale**: Simple integer-based roles provide sufficient granularity for a messaging bot while remaining easy to understand and implement.

## Cooldown System
**Problem**: Prevent command spam and API abuse.

**Solution**: Cooldown Map tracking user/command pairs with configurable delays per command.

**Rationale**: Per-command cooldowns allow flexibility - expensive operations (AI, image generation) can have longer cooldowns than simple utilities.

## Configuration Management
**Problem**: Bot needs persistent configuration and FCA (Facebook Chat API) options.

**Solution**: JSON-based configuration in `data/config.json` with FCA options, admin lists, and bot settings. Auto-creates default config if missing.

**Rationale**: JSON provides human-readable configuration that can be easily edited. Separate data directory keeps user data isolated from code.

## Web Interface
**Problem**: Users need a way to authenticate the bot and manage settings without command-line access.

**Solution**: Express.js web server serving HTML interfaces for bot setup, guide pages, and active user monitoring.

**Rationale**: Web interface lowers the barrier to entry - users can set up the bot through a browser instead of editing config files directly.

## Scheduled Tasks
**Problem**: Bot needs to perform actions at specific times (auto-posting quotes, verses).

**Solution**: node-cron integration for scheduled tasks, particularly in the autopost event handler.

**Rationale**: Cron syntax provides familiar and flexible scheduling. Tasks run independently of user interactions.

## Event Handling
**Problem**: React to Facebook events like user joins, message unsends, member leaving.

**Solution**: Separate event handler modules in `script/event/` that process specific Facebook event types (log:subscribe, message_unsend, etc.).

**Rationale**: Event-driven architecture naturally maps to Facebook's event system. Each event type has dedicated logic without cluttering command handlers.

## Message Unsend Recovery
**Problem**: Users can unsend messages, hiding potentially important content.

**Solution**: Cache all messages in memory indexed by messageID, then retrieve and resend when unsend event occurs.

**Rationale**: Provides transparency in group conversations. Memory-based cache is simple but will reset on bot restart (acceptable tradeoff for this use case).

## Anti-Leave Mechanism
**Problem**: Prevent users from leaving specific groups.

**Solution**: `antiout.js` event handler that detects leave events and immediately re-adds the user.

**Rationale**: Useful for mandatory groups or educational settings. Uses Facebook's native add-user functionality.

# External Dependencies

## Third-Party APIs

1. **biar-fca** (Facebook Chat API)
   - Purpose: Core library for Facebook Messenger interaction
   - Handles authentication, message sending/receiving, and event monitoring

2. **Kohi API Library** (`api-library-kohi.onrender.com`)
   - GPT-4o AI chat (text and image understanding)
   - GPT-5/Copilot AI chat
   - Pollinations image generation (Flux model)

3. **Zetsu API** (`api.zetsu.xyz`)
   - Welcome canvas image generation with user avatars and group info

4. **Hiroshi API** (`hiroshi-api.onrender.com`)
   - Spotify song search and MP3 download

5. **Mademoiselle API** (`mademoiselle2-rest-apis.onrender.com`)
   - Bible verse fetching

6. **Bible.org Labs API** (`labs.bible.org`)
   - Random Bible verse generation for auto-posting

7. **GitHub Raw Content**
   - Quote database from JamesFT/Database-Quotes-JSON for motivational auto-posts

## Key NPM Packages

- **express**: Web server for bot management interface
- **axios**: HTTP client for API requests
- **node-cron**: Scheduled task execution
- **chalk**: Terminal output formatting
- **canvas**: Server-side image manipulation (if needed)
- **moment-timezone**: Timezone-aware date/time handling
- **ytdl-core**: YouTube video downloading
- **yt-search**: YouTube search functionality

## Data Storage

- **File-based JSON**: Configuration (`data/config.json`) and history (`data/history.json`)
- **In-memory Maps**: Commands, event handlers, user accounts, cooldowns, and message cache
- No database currently configured, though the config includes a database flag for potential future integration

## Authentication

- **Facebook Cookies/AppState**: Bot authenticates to Facebook using JSON appstate provided through the web interface
- Admin authentication based on Facebook UID list in config.json