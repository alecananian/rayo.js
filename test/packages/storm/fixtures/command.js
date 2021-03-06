const { storm } = require('../../../../packages/storm');

const workers = parseInt(process.argv[2], 10);
const command = process.argv[4];
storm(
  () => {
    process.stdout.write('Worker!');
    process.send('Hello from the worker!');
    process.on('message', () => {
      setTimeout(process.exit, 200);
    });
  },
  {
    keepAlive: false,
    monitor: false,
    workers,
    master(cluster) {
      const worker = cluster.workers[1];
      worker.on('message', (message) => {
        process.stdout.write(
          typeof message === 'object' ? JSON.stringify(message) : message
        );
      });

      this.on('worker', () => {
        worker.send(command);
      });
    }
  }
);
