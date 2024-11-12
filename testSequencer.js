// testSequencer.js
const TestSequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends TestSequencer {
  sort(tests) {
    // Sort tests based on the first two characters of their paths
    return tests.sort((a, b) => {
      const aPrefix = a.path.slice(0, 2); // Get the first 2 characters of file path
      const bPrefix = b.path.slice(0, 2);
      return aPrefix.localeCompare(bPrefix); // Compare the prefixes
    });
  }
}

module.exports = CustomSequencer;
