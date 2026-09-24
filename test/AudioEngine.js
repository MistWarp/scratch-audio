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

const fakeContext = overrides => Object.assign({
    createGain: () => ({
        connect () {},
        disconnect () {}
    }),
    destination: {},
    state: 'running',
    close: () => Promise.resolve()
}, overrides);

tap.test('a suspended context is resumed before a sound plays', t => {
    let resumed = 0;
    const engine = new AudioEngine(fakeContext({
        state: 'suspended',
        resume: () => {
            resumed++;
            return Promise.resolve();
        }
    }));
    t.equal(engine.resumeIfSuspended(), true);
    t.equal(resumed, 1);

    engine.audioContext.state = 'running';
    t.equal(engine.resumeIfSuspended(), false);
    t.equal(resumed, 1, 'a running context is left alone');
    t.end();
});

tap.test('a failed resume does not reject anything', async t => {
    const engine = new AudioEngine(fakeContext({
        state: 'suspended',
        resume: () => Promise.reject(new Error('not allowed'))
    }));
    t.equal(engine.resumeIfSuspended(), true);
    await new Promise(resolve => {
        setTimeout(resolve, 0);
    });
    t.pass('the rejection was handled');
    t.end();
});

tap.test('dispose closes audio once and releases the microphone', async t => {
    let closed = 0;
    let disconnected = 0;
    let microphoneDisposed = 0;
    const engine = new AudioEngine(fakeContext({
        createGain: () => ({
            connect () {},
            disconnect () {
                disconnected++;
            }
        }),
        close: () => {
            closed++;
            return Promise.resolve();
        }
    }));
    engine.loudness = {dispose: () => {
        microphoneDisposed++;
    }};
    await engine.dispose();
    await engine.dispose();
    t.equal(closed, 1);
    t.equal(disconnected, 1);
    t.equal(microphoneDisposed, 1);
});
