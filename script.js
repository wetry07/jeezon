import { WebContainer } from '@webcontainer/api';

let webcontainerInstance;

// Initialize WebContainer
async function bootWebContainer() {
  webcontainerInstance = await WebContainer.boot();

  // Mount initial files
  await webcontainerInstance.mount({
    'index.js': {
      file: {
        contents: '',
      },
    },
    'package.json': {
      file: {
        contents: JSON.stringify({
          name: 'js-runner',
          version: '1.0.0',
          main: 'index.js',
          scripts: {
            start: 'node index.js',
          },
        }),
      },
    },
  });

  // Install Node.js
  const installProcess = await webcontainerInstance.spawn('npm', ['install']);
  installProcess.output.pipeTo(new WritableStream({ write: appendToTerminal }));

  installProcess.exit.then(() => {
    appendToTerminal('Environment Ready!\n');
  });
}

// Append output to terminal
function appendToTerminal(line) {
  const terminal = document.getElementById('terminal');
  terminal.textContent += line;
  terminal.scrollTop = terminal.scrollHeight;
}

// Run JavaScript Code
async function runCode() {
  const jsCode = document.getElementById('js-editor').value;

  // Write code to index.js
  await webcontainerInstance.fs.writeFile('/index.js', jsCode);

  // Run the code
  const process = await webcontainerInstance.spawn('npm', ['start']);
  process.output.pipeTo(new WritableStream({ write: appendToTerminal }));
  process.exit.then(() => appendToTerminal('Execution finished.\n'));
}

document.getElementById('run-button').addEventListener('click', runCode);

// Boot WebContainer when the page loads
bootWebContainer();