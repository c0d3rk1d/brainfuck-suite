#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function run() {
    options.run_start = Date.now();
    if (options.output) {
        if (options.output === "-") {
            process.stdout.write(output + "\n");
        } else {
            fs.writeFileSync(path.resolve(options.output), output, "utf8");
        }
    } else {
        process.stdout.write(output + "\n");
    }
    options.run_end = Date.now();
    if (options.stats) {
        const duration = options.run_end - options.run_start;
        const statsOutput = `Execution time: ${duration} ms`;
        if (options.output) {
            if (options.output === "-") {
                process.stdout.write(statsOutput + "\n");
            } else {
                fs.appendFileSync(path.resolve(options.output), statsOutput + "\n", "utf8");
            }
        } else {
            process.stdout.write(statsOutput + "\n");
        }
    }
}

const arguments = process.argv.slice(2);
const options = {
    "cell_size": 8,
    "cell_wrapping": true,
    "debug": false,
    "dynamic_memory": true,
    "memory_size": 1,
    "output": "-",
    "stats": false
};

for (let i = 0; i < arguments.length; i++) {
    switch (arguments[i].toLowerCase()) {
        case "--help":
        case "-h":
            console.log(`
Brainfuck Programming Language Suite - Interpreter
Version 1.0.0 by Kay Anar
https://github.com/c0d3rk1d/brainfuck-suite

Usage: bf.run.js [options]

Options:
  --help, -h
      Show this help message.

  --input, -i <file>
      Input file containing code. Use "-" to read from stdin.

  --output, -o <file>
      Output file. Use "-" for stdout. Default: stdout.

  --code, -c <code>
      Provide code directly as a string.

  --cell-size, -cs <bits>
      Set cell size in bits (1-32). Default: 8.

  --cell-wrapping, -cw <on|off>
      Enable or disable cell wrapping. Default: on.

  --memory-size, -ms <number>
      Set the memory size (number of cells). Default: 1.

  --dynamic-memory, -dm <on|off>
      Enable or disable dynamic memory. Default: on.

  --debug, -d <on|off>
      Enable or disable debug mode. Default: off.

  --stats, -s <on|off>
      Enable or disable stats output. Default: off.

Examples:
  # Run Brainfuck code from a file and output to stdout
  $ bf.run.js --input program.bf

  # Provide Brainfuck code as a string and save the output
  $ bf.run.js --code "++++[>++++<-]>+." --output out.txt

  # Use a different cell size and enable debug mode
  $ bf.run.js -c "++[>++<-]>." --cell-size 16 --debug true

  # Read from stdin and write to stdout
  $ echo "++>++." | bf.run.js -i -
`);
            process.exit(0);
        case "--input":
        case "-i":
            if (options.code) {
                console.error(`Error: ${arguments[i]} and ${arguments.find(argument => ["-c", "--code"].includes(argument.toLowerCase()))} cannot be used at the same time.`);
                process.exit(1);
            }
            options.input = arguments[++i];
            break;
        case "--output":
        case "-o":
            options.output = arguments[++i];
            break;
        case "--code":
        case "-c":
            if (options.input) {
                console.error(`Error: ${arguments[i]} and ${arguments.find(argument => ["-i", "--input"].includes(argument.toLowerCase()))} cannot be used at the same time.`);
                process.exit(1);
            }
            options.code = arguments[++i];
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
        case "--memory-size":
        case "-ms":
            const memorySize = parseInt(arguments[++i], 10);
            if (isNaN(memorySize) || memorySize < 1) {
                console.error(`Error: Parameter for ${arguments[i - 1]} must be a number greater than 1.`);
                process.exit(1);
            }
            options.memory_size = memorySize;
            break;

            break;
        case "--dynamic-memory":
        case "-dm":
            const dynamicMemory = `${arguments[++i]}`.toLowerCase();
            if (!["on", "off"].includes(dynamicMemory)) {
                console.error(`Error: ${arguments[i - 1]} must be "on" or "off".`);
                process.exit(1);
            }
            options.dynamic_memory = false;
            options.dynamic_memory = dynamicMemory === "on" || dynamicMemory === "1" || dynamicMemory === "true";
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

if (options.input) {
    if (options.input === "-") {
        process.stdin.setEncoding("utf8");
        options.code = "";
        process.stdin.on("data", chunk => options.code += chunk);
        process.stdin.on("end", () => run());
    } else {
        try {
            options.code = fs.readFileSync(path.resolve(options.input), "utf8");
            run();
        } catch (exception) {
            console.error(`Error: Unable to read input file. ${exception.message}`);
            process.exit(1);
        }
    }
} else if (options.code) {
    run();
}
else {
    console.error("Error: No input file or code provided. Use --help for usage.");
    process.exit(1);
}