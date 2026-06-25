# Change Log

All notable changes to the "purrgrammer" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]


## [0.0.7]

### Fixed
- Timer state restore now distinguishes between paused and running sessions, so a paused timer no longer “runs” while VS Code is closed.
- Timer reset now persists immediately, ensuring reloads always return to a fresh work session.
- Corrected the `onCommand:purrgrammer.showTimer` activation wiring so the command activates the extension reliably.
- Removed duplicate pet/timer callbacks so kitty animations aren’t triggered twice on session changes.
- Cleaned up a stray Escape-key handler that referenced removed intro logic.

### Changed
- Tightened the webview Content Security Policy while explicitly allowing local media so sounds work reliably.

### Added
- Sound on/off preference is now stored and restored between sessions.


## [0.0.6]

### Fixed
- Webview on window start bug.

### Added
- Extension controls (Command Palette: “Purrgrammer: Start Kitty Timer”).


## [0.0.5]

### Added
- Click sound for start/pause/reset.

### Changed
- Removed auto-start for all sessions to give users more control.


## [0.0.1]

- Initial release.
