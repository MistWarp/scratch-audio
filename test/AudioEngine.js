const tap = require('tap');
const AudioEngine = require('../src/AudioEngine');

const {AudioContext} = require('web-audio-test-api');

tap.test('AudioEngine', t => {
    const audioEngine = new AudioEngine(new AudioContext());

    t.plan(1);
    t.deepEqual(audioEngine.inputNode.toJSON(), {
        gain: {
            inputs: [],
            value: 1
        },
        inputs: [],
        name: 'GainNode'
    }, 'JSON Representation of inputNode');
});

tap.test('creates independent players from one decoded buffer', async t => {
    const audioEngine = new AudioEngine(new AudioContext());
    const decodedBuffer = audioEngine.audioContext.createBuffer(1, 8, 44100);

    const first = audioEngine.createSoundPlayer(decodedBuffer);
    const second = audioEngine.createSoundPlayer(decodedBuffer);

    t.not(first.id, second.id, 'players have separate identities');
    t.equal(first.buffer, decodedBuffer, 'first player uses the decoded buffer');
    t.equal(second.buffer, decodedBuffer, 'second player shares the decoded buffer');
});

tap.test('dispose closes audio once and releases the microphone', async t => {
    let closed = 0;
    let disconnected = 0;
    let microphoneDisposed = 0;
    const engine = new AudioEngine({createGain: () => ({connect () {}, disconnect () { disconnected++; }}),
        destination: {}, state: 'running', close: () => { closed++; return Promise.resolve(); }});
    engine.loudness = {dispose: () => { microphoneDisposed++; }};
    await engine.dispose();
    await engine.dispose();
    t.equal(closed, 1);
    t.equal(disconnected, 1);
    t.equal(microphoneDisposed, 1);
});
