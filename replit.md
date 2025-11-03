# Overview

This is a Facebook Messenger bot application built with Node.js that automates interactions on Facebook Messenger. The bot uses the `biar-fca` library (a Facebook Chat API wrapper) to handle authentication and messaging, and implements a modular command system with event handlers. It includes a web interface for bot configuration and monitoring, allowing users to submit Facebook authentication credentials (appState JSON) to activate the bot.

The bot supports multiple command types including AI integrations (Gemini, O3-Mini), utility commands (help, uid, unsend), media commands (Spotify, image generation), and automated features like welcome messages and anti-leave protection.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Application Entry Point
The application uses a two-tier process architecture with automatic restart capabilities:
- `index.js` - Process supervisor that spawns and monitors the main application
- `main.js` - Core bot application that handles Facebook login and command execution
- Automatic restart on exit code 1 enables fault tolerance and recovery from transient errors

**Rationale**: This supervisor pattern ensures the bot remains operational even after crashes or intentional restarts, improving reliability for 24/7 operation.

## Command System Architecture
The bot implements a dynamic, file-based command loading system:
- Commands are organized in the `/script` directory with automatic discovery
- Each command module exports a standardized config object (name, role, version, hasPrefix, aliases, description, usage, credits, cooldown)
- Commands are stored in a Map structure for O(1) lookup by name or alias
- Role-based access control (0=user, 2=admin) restricts command execution
- Cooldown system prevents command spam using a separate cooldown Map

**Design Decisions**:
- **Problem**: Need flexible command management without hardcoding
- **Solution**: File-based modular system with hot-loading capability
- **Pros**: Easy to add/remove commands, clear separation of concerns, scalable
- **Cons**: No validation at startup, potential for malformed modules

## Event Handler System
Event handlers operate separately from commands:
- Located in `/script/event` subdirectory
- Handle Facebook Messenger events (joins, leaves, unsends, etc.)
- Each handler exports config and handleEvent function
- Stored in separate Map for event-based dispatch

**Rationale**: Separating event handlers from commands allows passive monitoring and automatic responses without user interaction.

## Web Interface
Express-based web server provides user interface:
- Static file serving from `/public` directory
- HTML pages: index.html (home), guide.html (setup instructions), online.html (active users)
- Body-parser middleware for JSON payload processing
- Bootstrap 4 + Font Awesome for UI components

**Purpose**: Allows non-technical users to configure the bot by submitting Facebook credentials through a web form instead of editing files.

## Authentication Flow
Facebook authentication uses the `biar-fca` library:
- Accepts appState JSON (Facebook session cookies) for login
- Supports force login and event listening via fcaOption configuration
- Credentials stored in `/data/config.json`
- Admin UIDs defined in masterKey.admin array for privileged access

**Security Consideration**: AppState contains sensitive session tokens; the application relies on users protecting this data.

## Configuration Management
JSON-based configuration with default creation:
- `/data/config.json` - Bot settings (masterKey, fcaOption)
- `/data/history.json` - Conversation/action history tracking
- createConfig() function generates defaults if missing

**Trade-offs**: JSON files are simple but lack schema validation and can be corrupted by manual editing.

## Scheduling System
Uses `node-cron` for time-based automation:
- Autopost feature posts motivational quotes on schedule
- Cron expressions define intervals (e.g., `*/15 * * * *` for every 15 minutes)
- Cooldown mechanism prevents spam if scheduler runs too frequently

**Alternative Considered**: node-schedule was included as dependency but cron was chosen for simpler syntax.

# External Dependencies

## Core Facebook Integration
- **biar-fca** (v3.8.7) - Facebook Chat API wrapper for authentication and messaging
  - Handles login, message sending/receiving, and event listening
  - Provides anti-detection mechanisms for bot operation
  - Fork of ws3-fca with enhanced features

## AI Services
- **Kaiz APIs** (kaiz-apis.gleeze.com) - Third-party API provider requiring API keys
  - O3-Mini AI model endpoint for conversational AI
  - Gemini Vision API for image analysis and text generation
  - Fotor API for AI image generation
  - API key must be configured in command files (ai.js, gemini.js, imagine.js)

- **Hercai** (v12.2.0) - Alternative AI integration library (installed but not actively used in provided code)

## Media & Content Services
- **Hiroshi API** (hiroshi-api.onrender.com) - Spotify song download service
  - Converts Spotify tracks to MP3 format
  - No authentication required

- **Mademoiselle2 REST APIs** (mademoiselle2-rest-apis.onrender.com) - Bible verse API
  - Provides random Bible verses
  - No authentication required

- **Zetsu API** (api.zetsu.xyz) - Canvas/image generation for welcome messages
  - Creates customized welcome images with user info and group details

- **GitHub Raw Content** - Quote database for autopost feature
  - JamesFT/Database-Quotes-JSON repository for motivational quotes

## Web Server & HTTP
- **Express** (v4.18.2) - Web application framework
- **body-parser** (v1.20.2) - HTTP request body parsing middleware
- **axios** (v1.6.5) - HTTP client for API requests

## Utilities & Helpers
- **chalk** (v3.0.0) - Terminal string styling for colored console output
- **moment-timezone** (v0.5.37) - Timezone-aware date/time handling
- **luxon** (v3.4.4) - Alternative datetime library
- **node-cron** (v3.0.3) - Task scheduler for automated posting
- **canvas** (v2.9.3) - Image manipulation (likely for custom graphics)
- **cheerio** (v0.22.0) - HTML parsing and web scraping
- **yt-search** (v2.10.4), **ytdl-core** (v4.11.4) - YouTube integration (installed but not used in provided code)

## File System & Process Management
- **fs-extra** (v11.1.1) - Enhanced file system operations
- **child_process** (v1.0.2) - Process spawning for supervisor pattern
- **pidusage** (v3.0.0) - Process resource monitoring

## Data Storage
- **File-based JSON storage** for configuration and history
  - No database system currently implemented
  - Config indicates database support is disabled (database: false)
  - Future database integration may use Postgres/Drizzle based on project dependencies pattern

**Note**: The application architecture supports adding a database layer (masterKey.database flag exists) but currently relies on JSON file storage for simplicity.