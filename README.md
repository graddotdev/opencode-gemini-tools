# opencode-gemini-tools

A plugin for the OpenCode that enables Google Gemini's built-in tools: Google Search, Google Maps, URL Context, and Code Execution.

## Installation

Add the plugin to your OpenCode configuration file (e.g. `~/.config/opencode/opencode.json` or `.opencode/opencode.json` in your project):

```json
{
  "plugin": ["opencode-gemini-tools"]
}
```

OpenCode will automatically download and install the plugin from npm the next time it starts.

## Configuration

All four tools are enabled by default. To disable one, set its environment variable to `0` or `false` before starting OpenCode:

- `OPENCODE_GEMINI_TOOLS_ENABLE_GOOGLE_SEARCH`
- `OPENCODE_GEMINI_TOOLS_ENABLE_GOOGLE_MAPS`
- `OPENCODE_GEMINI_TOOLS_ENABLE_URL_CONTEXT`
- `OPENCODE_GEMINI_TOOLS_ENABLE_CODE_EXECUTION`

## License

MIT
