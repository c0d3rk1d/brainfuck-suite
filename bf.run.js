#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const VARIANTS = [];

// Read input or program
function runProgram(program) {
    let output = `Running program${opts.variant ? ' (variant: ' + opts.variant + ')' : ''}:\n${program}`;
    if (opts.output) {
        if (opts.output === '-') {
            process.stdout.write(output + '\n');
        } else {
            fs.writeFileSync(path.resolve(opts.output), output, 'utf8');
        }
    } else {
        process.stdout.write(output + '\n');
    }
}

const arguments = process.argv.slice(2);
const opts = {};

for (let i = 0; i < arguments.length; i++) {
    switch (arguments[i].toLowerCase()) {
        case '--help':
        case '-h':
            console.log(`
Usage: bf.run.js [options]

Options:
  --help, -h                                    Show this help message
  --config, -x <file>                           Path to JSON config file
  --input, -i <file>                            Input file with code ('-' for stdin)
  --output, -o <file>                           Output file
  --code, -c <code>                             Code as a string
  --variant, -v <name>                          Language variant
  --cell-size, -cs <bits>                       Cell size in bits between 1 and 32
  --cell-wrapping, -cw <on|off|1|0|true|false>  Enable/disable cell wrapping
  --memory-size, -ms <number>                   Memory size (number of cells)
  --dynamic-memory, -dm <on|off>                Enable/disable dynamic memory
  --debug, -d <on|off|1|0|true|false>           Enable/disable debug mode
  --stats, -s <on|off|1|0|true|false>           Enable/disable stats output
`);
            process.exit(0);
        case '--config':
        case '-x':
            opts.config = arguments[++i];
            break;
        case '--input':
        case '-i':
            opts.input = arguments[++i];
            break;
        case '--output':
        case '-o':
            opts.output = arguments[++i];
            break;
        case '--code':
        case '-c':
            opts.program = arguments[++i];
            break;
        case '--variant':
        case '-v':
            opts.variant = arguments[++i];
            break;
        case '--cell-size':
        case '-cs':
            opts.cell_size = arguments[++i];
            break;
        case '--cell-wrapping':
        case '-cw':
            opts.cell_wrapping = arguments[++i];
            break;
        case '--memory-size':
        case '-ms':
            opts.memory_size = arguments[++i];
            break;
        case '--dynamic-memory':
        case '-dm':
            opts.dynamic_memory = arguments[++i];
            break;
        case '--debug':
        case '-d':
            opts.debug = arguments[++i];
            break;
        case '--stats':
        case '-s':
            opts.stats = arguments[++i];
            break;
        default:
            console.warn(`Unknown argument: ${arguments[i]}. User --help for usage.`);
            process.exit(1);

    }
}

// Validation
if ((!opts.input && !opts.program) || (opts.input && opts.program)) {
    console.error('Error: You must specify either --input or --code, but not both. Use --help for usage.');
    process.exit(1);
}

// Load config if specified
let config = {};
if (opts.config) {
    try {
        config = JSON.parse(fs.readFileSync(path.resolve(opts.config), 'utf8'));
    } catch (e) {
        console.error(`Error reading config file: ${e.message}`);
        process.exit(1);
    }
}

if (opts.input) {
    if (opts.input === '-') {
        // Read from stdin
        process.stdin.setEncoding('utf8');
        let data = '';
        process.stdin.on('data', chunk => data += chunk);
        process.stdin.on('end', () => runProgram(data));
    } else {
        try {
            const program = fs.readFileSync(path.resolve(opts.input), 'utf8');
            runProgram(program);
        } catch (e) {
            console.error(`Error reading input file: ${e.message}`);
            process.exit(1);
        }
    }
} else if (opts.program) {
    runProgram(opts.program);
}