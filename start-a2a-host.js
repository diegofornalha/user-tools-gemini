
import { A2AHost } from '@a2a-js/sdk';

async function main() {
  try {
    // 1. Create a new A2A Host instance
    const host = new A2AHost();

    // 2. Start the host server on the default port
    await host.start();

    console.log(`✅ A2A Host Server started successfully.`);
    console.log(`Listening on: ${host.getAddress()}`);
    console.log('Press Ctrl+C to stop the server.');

    // Keep the process running
    process.stdin.resume();

  } catch (error) {
    console.error('❌ Failed to start A2A Host Server:');
    console.error(error);
    process.exit(1);
  }
}

main();
