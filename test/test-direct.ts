import { spawn } from 'child_process';

async function testClaudeCLI() {
  console.log('Testing direct Claude CLI call...\n');

  const claude = spawn('claude', [
    '-p',
    'What is 2 + 2? Give me only the number.',
    '--dangerously-skip-permissions'
  ], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, NO_COLOR: '1' }
  });

  let stdout = '';
  let stderr = '';

  claude.stdout.on('data', (data) => {
    stdout += data.toString();
    console.log('STDOUT:', data.toString());
  });

  claude.stderr.on('data', (data) => {
    stderr += data.toString();
    console.log('STDERR:', data.toString());
  });

  claude.on('close', (code) => {
    console.log('\n--- Process completed ---');
    console.log('Exit code:', code);
    console.log('Final output:', stdout);
    if (stderr) {
      console.log('Errors:', stderr);
    }
  });

  claude.on('error', (error) => {
    console.error('Failed to spawn claude CLI:', error);
  });
}

testClaudeCLI().catch(console.error);