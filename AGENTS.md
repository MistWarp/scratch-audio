# AGENTS.md

scratch-audio plays MistWarp project sounds: decoding (including ADPCM), the sound players, effects such as pitch, pan and volume, and microphone loudness. It is a fork of TurboWarp's audio engine, written in CommonJS JavaScript, and scratch-gui pins it to a commit.

## Where code goes

- `src/AudioEngine.js` is the entry point the VM uses. `SoundPlayer.js` plays one sound, `SoundBank.js` holds a target's sounds, and `effects/` holds the effect chain. `Loudness.js` reads the microphone.

## Things that look safe to change but are not

- Sound timing and effects must match Scratch. The scratch-parity project (git.rotur.dev/Mist/scratch-parity) includes a sound timing regression, and its results must not change.
- Browsers suspend an `AudioContext` until the page gets a user gesture. Resume it, don't assume it is running.
- Keep the `AudioEngine`, `SoundPlayer` and effect method names stable. scratch-vm calls them directly.

## Checks

`npm run lint`, `npm run tap` (this tap version has no `terse` reporter), `npm run build`, and `npm run check:conventions`, which rejects code comments and em dashes in the lines you add.

## Working here

- The default branch is `develop`. This repo is a fork, so open PRs with `gh pr create -R MistWarp/scratch-audio --base develop`.
- No code comments: name things so the code explains itself. No em dashes anywhere.
- Never add `Co-Authored-By` or any AI or tool attribution to commits or PRs.
- READMEs are overviews. Documentation goes in MistWarp/docs (https://mistwarp.org/docs/).
