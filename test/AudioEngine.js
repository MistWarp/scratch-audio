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
