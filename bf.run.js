#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const arguments = process.argv.slice(2);

const options = {
    "cell_size": 8,
    "cell_wrapping": true,
    "debug": false,
    "dynamic_tape": true,
    "input": "-",
    "output": "-",
    "stats": false,
    "tape_size": 1,
    "tape_wrapping": false,
};

const statistics = {};

for (let i = 0; i < arguments.length; i++) {
    switch (arguments[i].toLowerCase()) {
        case "--help":
        case "-h":
            console.log(`
Brainfuck Programming Language Suite - Interpreter
Version 1.0.0 by Kay Anar
https://github.com/c0d3rk1d/brainfuck-suite

Usage:
  bf.run.js [options]

Options:
  --help, -h
      Show this help message.

  --file, -f <file>
      Specify a file containing Brainfuck code. Use '-' to read from the descriptor specified by '--input'.

  --code, -c <code>
      Provide Brainfuck code directly as a string.

  --input, -i <descriptor>
      Specify an input descriptor. Use '-' to read from stdin. Default: 'stdin'.

  --output, -o <descriptor>
      Specify an output descriptor. Use '-' for output to stdout. Default: 'stdout'.

  --cell-size, -cs <bits>
      Set the size of each memory cell in bits (1-32). Default: '8'.

  --cell-wrapping, -cw <on|off>
      Enable or disable cell wrapping. Default: 'on'.

  --tape-size, -ts <number>
      Set the memory tape size (number of cells). Default: '1'.

  --tape-wrapping, -tw <on|off>
      Enable or disable tape wrapping. Default: 'off'.

  --dynamic-tape, -dt <on|off>
      Enable or disable dynamic tape resizing. Default: 'on'.

  --debug, -d <on|off>
      Enable or disable debug mode. Default: 'off'.

  --stats, -s <on|off>
      Enable or disable stats output. Default: 'off'.

Examples:

  # Run Brainfuck code from a file and output to stdout
  $ bf.run.js --file program.bf

  # Provide Brainfuck code as a string and save the output to a file
  $ bf.run.js --code "++++[>++++<-]>+." --output out.txt

  # Use a different cell size and enable debug mode
  $ bf.run.js -c "++[>++<-]>." --cell-size 16 --debug on

  # Read from Brainfuck code stdin and output to stdout
  $ echo "++>++." | bf.run.js -f -

  # Run Brainfuck code with dynamic tape enabled and output stats
  $ bf.run.js --code "++++[>+++[>+<-]<-]>>." --dynamic-tape on --stats on

  # Run Brainfuck code with no cell wrapping and 16-bit cells
  $ bf.run.js --code "++++++++[->++++++++<]>." --cell-wrapping off --cell-size 16

  # Run Brainfuck code from a file with custom tape size and no debug mode
  $ bf.run.js --file program.bf --tape-size 300 --debug off

  # Run code and specify input from a file, output to stdout
  $ bf.run.js --file input.bf --output -

  # Specify custom tape size and use stdin for input
  $ echo "++++++++[->++++[->++<]<-]>." | bf.run.js --input - --tape-size 50

  # Debug a Brainfuck program with verbose output and small memory size
  $ bf.run.js -c "++++[>++++<-]>." --debug on --tape-size 1 --cell-size 8
`);
            process.exit(0);
        case "--file":
        case "-f":
            if (options.code) {
                console.error(`Error: ${arguments[i]} and ${arguments.find(argument => ["-c", "--code"].includes(argument.toLowerCase()))} cannot be used at the same time.`);
                process.exit(1);
            }
            const file = arguments[++i];
            options.file = file == "-" ? "-" : path.resolve(file);
            break;
        case "--code":
        case "-c":
            if (options.file) {
                console.error(`Error: ${arguments[i]} and ${arguments.find(argument => ["-f", "--file"].includes(argument.toLowerCase()))} cannot be used at the same time.`);
                process.exit(1);
            }
            options.code = arguments[++i];
            break;
        case "--input":
        case "-i":
            options.input = arguments[++i];
            break;
        case "--output":
        case "-o":
            options.output = arguments[++i];
            break;
        case "--cell-size":
        case "-cs":
            const cellSize = parseInt(arguments[++i], 10);
            if (isNaN(cellSize) || cellSize < 1 || cellSize > 32) {
                console.error(`Error: Parameter for ${arguments[i - 1]} must be a number between 1 and 32.`);
                process.exit(1);
            }
            options.cell_size = cellSize;
            break;
        case "--cell-wrapping":
        case "-cw":
            const cellWrapping = `${arguments[++i]}`.toLowerCase();
            if (!["on", "off"].includes(cellWrapping)) {
                console.error(`Error: Parameter for ${arguments[i - 1]} must be "on" or "off".`);
                process.exit(1);
            }
            options.cell_wrapping = false;
            options.cell_wrapping = cellWrapping === "on" || cellWrapping === "1" || cellWrapping === "true";
            break;
        case "--tape-size":
        case "-ts":
            const tapeSize = parseInt(arguments[++i], 10);
            if (isNaN(tapeSize) || tapeSize < 1) {
                console.error(`Error: Parameter for ${arguments[i - 1]} must be a number greater than 1.`);
                process.exit(1);
            }
            options.tape_size = tapeSize;
            break;

            break;
        case "--tape-wrapping":
        case "-tw":
            const tapeWrapping = `${arguments[++i]}`.toLowerCase();
            if (!["on", "off"].includes(tapeWrapping)) {
                console.error(`Error: Parameter for ${arguments[i - 1]} must be "on" or "off".`);
                process.exit(1);
            }
            options.tape_wrapping = false;
            options.tape_wrapping = tapeWrapping === "on" || tapeWrapping === "1" || tapeWrapping === "true";
            break;
        case "--dynamic-tape":
        case "-et":
            const dynamicTape = `${arguments[++i]}`.toLowerCase();
            if (!["on", "off"].includes(dynamicTape)) {
                console.error(`Error: ${arguments[i - 1]} must be "on" or "off".`);
                process.exit(1);
            }
            options.dynamic_tape = false;
            options.dynamic_tape = dynamicTape === "on" || dynamicTape === "1" || dynamicTape === "true";
            break;
        case "--debug":
        case "-d":
            const debug = `${arguments[++i]}`.toLowerCase();
            if (!["on", "off"].includes(debug)) {
                console.error(`Error: Parameter for ${arguments[i - 1]} must be "on" or "off".`);
                process.exit(1);
            }
            options.debug = false;
            options.debug = debug === "on" || debug === "1" || debug === "true";
            break;
        case "--stats":
        case "-s":
            const stats = `${arguments[++i]}`.toLowerCase();
            if (!["on", "off"].includes(stats)) {
                console.error(`Error: Parameter for ${arguments[i - 1]} must be "on" or "off".`);
                process.exit(1);
            }
            options.stats = false;
            options.stats = stats === "on" || stats === "1" || stats === "true";
            break;
        default:
            console.warn(`Error: Unknown argument ${arguments[i]}. Use --help for usage.`);
            process.exit(1);

    }
}

statistics.total_execution_time = Date.now();
statistics.code_load_time = Date.now();
if (options.file) {
    try {
        options.code = fs.readFileSync(options.file === "-" ? (options.input === "-" ? 0 : options.input) : options.file, "utf8");
    } catch (exception) {
        console.error(`Error: Unable to read from ${options.file === "-" ? (options.input === "-" ? "stdin" : options.input) : "file " + options.file}. ${exception.message}`);
        process.exit(1);
    }
}
if (!options.code) {
    console.error("Error: No input file or code provided. Use --help for usage.");
    process.exit(1);
}
statistics.code_input_size = options.code.length;
options.code = options.code.replace(RegExp(`[^+-<>\\[\\],.${options.debug ? "#" : ""}]`, "g"), "");
statistics.executable_code_size = options.code.length;
statistics.code_load_time = Date.now() - statistics.code_load_time;

let tapePointer = 0;
const tape = Array(options.tape_size).fill(0);

statistics.total_execution_time = Date.now() - statistics.total_execution_time;

console.log(JSON.stringify({
    options: options,
    statistics: statistics,
}, null, 2));
let codePointer = 0;

while (codePointer < options.code.length) {
    const command = options.code[codePointer];
    switch (command) {
        case ">":
            tapePointer++;
            if (tapePointer >= tape.length) {
                if (options.dynamic_tape) {
                    tape.push(0);
                } else if (options.tape_wrapping) {
                    tapePointer = 0;
                } else {
                    console.error("Error: Tape pointer out of bounds. Use --tape-wrapping to enable wrapping or --dynamic-tape to allow dynamic tape growth.");
                    process.exit(1);
                }
            }
            break;
        case "<":
            tapePointer--;
            if (tapePointer < 0) {
                if (options.tape_wrapping) {
                    tapePointer = tape.length - 1;
                } else {
                    console.error("Error: Tape pointer out of bounds. Use --tape-wrapping to enable wrapping.");
                    process.exit(1);
                }
            }
            break;
        case "+":
            tape[tapePointer] = tape[tapePointer] + 1;
            if (tape[tapePointer] >= (1 << options.cell_size)) {
                if (options.cell_wrapping) {
                    tape[tapePointer] = 0;
                } else {
                    console.error(`Error: Cell value exceeds maximum for ${options.cell_size}-bit cells. Use --cell-wrapping to enable wrapping.`);
                    process.exit(1);
                }
            }
            break;
        case "-":
            tape[tapePointer] = tape[tapePointer] - 1;
            if (tape[tapePointer] < 0) {
                if (options.cell_wrapping) {
                    tape[tapePointer] = (1 << options.cell_size) - 1;
                } else {
                    console.error(`Error: Cell value cannot be negative for ${options.cell_size}-bit cells. Use --cell-wrapping to enable wrapping.`);
                    process.exit(1);
                }
            }
            break;
        case ".":
            if (options.output === "-") {
                process.stdout.write(String.fromCharCode(tape[tapePointer]));
            } else {
                fs.appendFileSync(path.resolve(options.output), String.fromCharCode(tape[tapePointer]), "utf8");
            }
            break;
        case ",":
            const buffer = Buffer.alloc(4);
            const bytesRead = fs.readSync(0, buffer, 0, 4);
            let inputChar = 0;
            if (bytesRead > 0) {
                const str = buffer.subarray(0, bytesRead).toString("utf8");
                if (str.length > 0) {
                    inputChar = str.codePointAt(0);
                }
            }
            tape[tapePointer] = inputChar;
            if (tape[tapePointer] >= (1 << options.cell_size)) {
                if (options.cell_wrapping) {
                    tape[tapePointer] = inputChar % (1 << options.cell_size);
                } else {
                    console.error(`Error: Cell value exceeds maximum for ${options.cell_size}-bit cells. Use --cell-wrapping to enable wrapping.`);
                    process.exit(1);
                }
            }
            break;
    }
    codePointer++;
}


// function run() {
//     options.run_start = Date.now();
//     if (options.output) {
//         if (options.output === "-") {
//             process.stdout.write(output + "\n");
//         } else {
//             fs.writeFileSync(path.resolve(options.output), output, "utf8");
//         }
//     } else {
//         process.stdout.write(output + "\n");
//     }
//     options.run_end = Date.now();
//     if (options.stats) {
//         const duration = options.run_end - options.run_start;
//         const statsOutput = `Execution time: ${duration} ms`;
//         if (options.output) {
//             if (options.output === "-") {
//                 process.stdout.write(statsOutput + "\n");
//             } else {
//                 fs.appendFileSync(path.resolve(options.output), statsOutput + "\n", "utf8");
//             }
//         } else {
//             process.stdout.write(statsOutput + "\n");
//         }
//     }
// }

console.log(JSON.stringify(tape, null, 2));
