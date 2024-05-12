module.exports = function (RED) {
  function CheckRetryNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.on('input', function (msg) {
      let retries = config.retry_count || 5; // Default retries to 5 if not defined
      let delay = config.delay_time || 1000; // Default delay to 1000 ms if not defined
      let entityId = config.entity_id;
      let expectedState = config.expected_state || 'on';

      function checkState() {
        const states = global.get('homeassistant.homeAssistant.states');
        const state = states[entityId]?.state;

        if (state === expectedState) {
          node.send([msg, null]); // First output for success
        } else {
          if (retries > 0) {
            retries--;
            setTimeout(checkState, delay);
          } else {
            node.send([null, msg]); // Second output for failure after retries
          }
        }
      }

      checkState();
    });
  }
  RED.nodes.registerType('check-retry', CheckRetryNode);
};
