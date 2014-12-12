module.exports = {
  deployer: {
    service: 'modulus',
    project: 'myproject'
  },
  notifiers: [
    {
      service: 'webhook',
      body: function(review_url) {
        return {review_url: review_url + 'test'};
      }
    }
  ]
};
