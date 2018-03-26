# CHANGELOG 

## 0.4.0
 - Change: Update the visibility demo so that the obstruction element is detected correctly
 - Security: Regenrate secret.key on every build, and do not commit it to the repo
 - Added: CHANGELOG.md
 - Change: Updated demos
 - Feature: push-expand
 - Change: Updated paralleleshell to v3, to fix https://github.com/darkguy2008/parallelshell/issues/57

## v0.3.0
 - Fixed: findIndex is not supported by IE10

## v0.2.7
 - Added: WeakMap, Object.assign and Object.freeze polyfills, and then cried after seeing the 22k increase in filesize...

## v0.2.6
 - Change: Make geom.self relative to the visible rectangle
 - Added: Child iframe background

## v0.2.5
 - Fix: Avoid registering the same Iframe twice
 - Removed: Balalaika is not needed for this module

## v0.2.3
 - Change: Replace CryptoJS with a simlpe XOR.
 - Change: Rename safeframe_config to safeframe_secret
 - Added: Add support to send encrypted data to the Safeframe
 - Change: Rename bin/genkey.js to bin/generate-key.js
 - Fix: demos link.

## v0.2.2
 - Change: Configure Babel to work better with webpack's treeshaking.
 - Change: Cleanup tests config
 - Change: Update README.md

## v0.2.1
 - Change: Freeze the info object

## v0.2.0
 - Added: Make errors accessible to the guest ($sf.info.errs)
 - Change: Update LICENSE.md
 - Change: Update README.md

## v0.1.3
 - Added: Adding mocha tests, and fixing some minor issues
 - Change: Reorder scripts

## v0.1.2
 - Added: Add version on top of the generated files
 - Fix: Babel transpiling of the static methods does not seem to work correctly.

## v0.1.1
 - Change: Capitalize messages
 - Fix: explicitely declare fromEvent as static, since Babel transpiling does not seem to do this correctly for es2015
 - Fix: Make sure there is a fallback object in case this metadata key is undefined
 - Change: Reversed the order of arguments
 - Added: Added log messages to remind the developer to run necessary steps
 - Change: Updated the deploy script
 - Change: Updated README.md

## v0.1.0
 - Added basic repo files
 - Initial commit
