#!/usr/bin/env node

const fs = require("fs");
const path = require("path");


process.stdin.setEncoding("utf8");

(async () => {
    const arguments = process.argv.slice(2);

    let options = {};

    let statistics = {
        "total_execution_time": performance.now(),
        "number_of_commands_executed": 0,
        "command_execution_time": 0,
        "max_tape_size": 0,
    };

    for (let i = 0; i < arguments.length; i++) {
        switch (arguments[i].toLowerCase()) {
            case "--help":
            case "-h":
                console.log(`
Brainfuck Programming Language Suite - Interpreter
Version 1.0.0 by Kay Anar
https://github.com/c0d3rk1d/brainfuck-suite

Usage:
  bf.run.js [options] <file | ->

  <file>     Path to a file containing Brainfuck code to execute.
  -          Read code from the descriptor specified by --input.

Options:
  --help, -h
      Show this help message.

  --code, -c <code>
      Provide Brainfuck code directly as a string.

  --cell-size, -cs <bits>
      Set the size of each memory cell in bits (1-64). Default: "8".

  --cell-wrapping, -cw <on|off>
      Enable or disable cell wrapping. Default: "on".

  --tape-size, -ts <number>
      Set the memory tape size (number of cells). Default: "1".

  --tape-wrapping, -tw <on|off>
      Enable or disable tape wrapping. Default: "off".

  --dynamic-tape, -dt <on|off>
      Enable or disable dynamic tape resizing. Default: "on".

  --newline, -n
      Print a newline after output. Default: "disabled".

  --debug, -d
      Enable debug mode. Default: "disabled".

  --stats, -s
      Enable stats output. Default: "disabled".

Examples:
  # Run Brainfuck code from a file
  $ bf.run.js program.bf

  # Read Brainfuck code from stdin
  $ echo "++>++." | bf.run.js -i - -

  # Provide Brainfuck code directly and output to file
  $ bf.run.js --code "++++[>++++<-]>+." --output out.txt

  # Use a custom cell size and enable debug mode
  $ bf.run.js -c "++[>++<-]>." --cell-size 16 --debug on

  # Run with no cell wrapping and 16-bit cells
  $ bf.run.js -c "++++++++[->++++++++<]>." --cell-wrapping off --cell-size 16

  # Read from input file and write to stdout
  $ bf.run.js input.bf --output -

  # Read from stdin as input and use dynamic tape
  $ echo ",[.,]" | bf.run.js - --input - --dynamic-tape on

`);
                process.exit(0);
            case "-":
                if (options.file || options.code) {
                    console.error(`Error: "-" cannot be used when a code ${options.code ? "string" : (options.file === "-" ? "source" : "file")} is already specified.`);
                    process.exit(1);
                }
                options.file = "-";
                break;
            case "--code":
            case "-c":
                if (options.file || options.code) {
                    console.error(`Error: "${arguments[i]}" cannot be used when a code ${options.code ? "string" : (options.file === "-" ? "source" : "file")} is already specified.`);
                    process.exit(1);
                }
                options.code = arguments[++i];
                break;
            case "--cell-size":
            case "-cs":
                if (options.cell_size) {
                    console.error(`Error: "${arguments[i]}" cannot be used when a cell size is already specified.`);
                    process.exit(1);
                }
                const cellSize = parseInt(arguments[++i], 10);
                if (isNaN(cellSize) || cellSize < 1 || cellSize > 64) {
                    console.error(`Error: Parameter for "${arguments[i - 1]}" must be a number between 1 and 64.`);
                    process.exit(1);
                }
                options.cell_size = cellSize;
                break;
            case "--cell-wrapping":
            case "-cw":
                if (options.cell_wrapping) {
                    console.error(`Error: "${arguments[i]}" cannot be used when cell wrapping is already specified.`);
                    process.exit(1);
                }
                const cellWrapping = `${arguments[++i]}`.toLowerCase();
                if (!["on", "off"].includes(cellWrapping)) {
                    console.error(`Error: Parameter for "${arguments[i - 1]}" must be "on" or "off".`);
                    process.exit(1);
                }
                options.cell_wrapping = cellWrapping === "on" || cellWrapping === "1" || cellWrapping === "true";
                break;
            case "--tape-size":
            case "-ts":
                if (options.tape_size) {
                    console.error(`Error: "${arguments[i]}" cannot be used when a tape size is already specified.`);
                    process.exit(1);
                }
                const tapeSize = parseInt(arguments[++i], 10);
                if (isNaN(tapeSize) || tapeSize < 1) {
                    console.error(`Error: Parameter for "${arguments[i - 1]}" must be a number greater than 1.`);
                    process.exit(1);
                }
                options.tape_size = tapeSize;
                statistics.max_tape_size = tapeSize;
                break;
            case "--tape-wrapping":
            case "-tw":
                if (options.tape_wrapping) {
                    console.error(`Error: "${arguments[i]}" cannot be used when tape wrapping is already specified.`);
                    process.exit(1);
                }
                const tapeWrapping = `${arguments[++i]}`.toLowerCase();
                if (!["on", "off"].includes(tapeWrapping)) {
                    console.error(`Error: Parameter for "${arguments[i - 1]}" must be "on" or "off".`);
                    process.exit(1);
                }
                options.tape_wrapping = tapeWrapping === "on" || tapeWrapping === "1" || tapeWrapping === "true";
                break;
            case "--dynamic-tape":
            case "-dt":
                if (options.dynamic_tape) {
                    console.error(`Error: "${arguments[i]}" cannot be used when dynamic tape is already specified.`);
                    process.exit(1);
                }
                const dynamicTape = `${arguments[++i]}`.toLowerCase();
                if (!["on", "off"].includes(dynamicTape)) {
                    console.error(`Error: "${arguments[i - 1]}" must be "on" or "off".`);
                    process.exit(1);
                }
                options.dynamic_tape = dynamicTape === "on" || dynamicTape === "1" || dynamicTape === "true";
                break;
            case "--newline":
            case "-n":
                options.newline = true
                break;
            case "--debug":
            case "-d":
                options.debug = true
                break;
            case "--stats":
            case "-s":
                options.stats = true;
                break;
            default:
                if (options.file || options.code || !fs.existsSync(arguments[i])) {
                    console.warn(`Error: Unknown argument "${arguments[i]}". Use --help for usage.`);
                    process.exit(1);
                }
                options.file = path.resolve(arguments[i]);
                break;
        }
    }

    options = {
        ...{
            "cell_size": 8,
            "cell_wrapping": true,
            "debug": false,
            "dynamic_tape": true,
            "stats": false,
            "tape_size": 1,
            "tape_wrapping": false,
        }, ...options
    };

    statistics.initial_tape_size = options.tape_size;

    statistics.code_load_time = performance.now();

    if (options.file) {
        try {
            options.code = fs.readFileSync(options.file, "utf8");
        } catch (exception) {
            console.error(`Error: Unable to read from file ${options.file}. ${exception.message}`);
            process.exit(1);
        }
    }
    if (!options.code) {
        console.error("Error: No input file or code provided. Use --help for usage.");
        process.exit(1);
    }
    statistics.code_input_size = options.code.length;
    options.code = options.code.replace(RegExp(`[^+\\-<>\\[\\],.${options.debug ? "#" : ""}]`, "gum"), "");
    statistics.executable_code_size = options.code.length;
    statistics.code_load_time = performance.now() - statistics.code_load_time;

    let tapePointer = 0;
    const tape = Array(options.tape_size).fill(0);

    statistics.command_execution_time = performance.now();
    let codePointer = 0;

    while (codePointer < options.code.length) {
        statistics.number_of_commands_executed++;
        const command = options.code[codePointer];
        switch (command) {
            case ">":
                tapePointer++;
                if (tapePointer >= tape.length) {
                    if (options.dynamic_tape) {
                        tape.push(0);
                        if (tape.length > statistics.max_tape_size) {
                            statistics.max_tape_size = tape.length;
                        }
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
                if (tape[tapePointer] >= Math.pow(2, options.cell_size)) {
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
                        tape[tapePointer] = Math.pow(2, options.cell_size) - 1;
                    } else {
                        console.error(`Error: Cell value cannot be negative for ${options.cell_size}-bit cells. Use --cell-wrapping to enable wrapping.`);
                        process.exit(1);
                    }
                }
                break;
            case ".":
                process.stdout.write(String.fromCharCode(tape[tapePointer]));
                break;
            case ",":
                const inputChar = await (new Promise((resolve) => {
                    process.stdin.setRawMode(true);
                    process.stdin.once("data", (key) => {
                        process.stdin.setRawMode(false);
                        resolve(key.charCodeAt(0));
                    });
                }));
                if (inputChar === 3) {
                    codePointer = options.code.length;
                    break;
                }
                tape[tapePointer] = inputChar;
                process.stdout.write(String.fromCharCode(inputChar));
//                console.log(JSON.stringify(tape, null, 2));
                if (tape[tapePointer] >= Math.pow(2, options.cell_size)) {
                    if (options.cell_wrapping) {
                        tape[tapePointer] = inputChar % Math.pow(2, options.cell_size);
                    } else {
                        console.error(`Error: Cell value exceeds maximum for ${options.cell_size}-bit cells. Use --cell-wrapping to enable wrapping.`);
                        process.exit(1);
                    }
                }
                break;
            case "[":
                let openBrackets = 1;
                let codeOffset = 0;
                while (openBrackets > 0) {
                    codeOffset++;
                    if (codePointer + codeOffset >= options.code.length) {
                        console.error("Error: Unmatched '[' in Brainfuck code.");
                        process.exit(1);
                    }
                    if (options.code[codePointer + codeOffset] === "[") {
                        openBrackets++;
                    } else if (options.code[codePointer + codeOffset] === "]") {
                        openBrackets--;
                    }
                }
                if (tape[tapePointer] === 0) {
                    codePointer += codeOffset;
                }
                break;
            case "]":
                let closeBrackets = 1;
                let loopPointer = codePointer;
                while (closeBrackets > 0) {
                    loopPointer--;
                    if (loopPointer < 0) {
                        console.error("Error: Unmatched ']' in Brainfuck code.");
                        process.exit(1);
                    }
                    if (options.code[loopPointer] === "]") {
                        closeBrackets++;
                    } else if (options.code[loopPointer] === "[") {
                        closeBrackets--;
                    }
                }
                if (tape[tapePointer] !== 0) {
                    codePointer = loopPointer;
                }
                break;
            case "#":
                if (options.debug) {
                    console.log(`Debug: Pointer: ${codePointer}, Tape Pointer: ${tapePointer}, Cell Value: ${tape[tapePointer]}, Tape: [${tape.join(", ")}]`);
                }
                break;
            default:
                console.error(`Error: Unknown command "${command}" at position ${codePointer}.`);
                process.exit(1);
        }
        while (options.dynamic_tape && tape[tape.length - 1] == 0 && tapePointer < tape.length - 1) {
            tape.pop();
        }
        codePointer++;
    }
    if(options.newline) {
        process.stdout.write("\n");
    }
    statistics.final_tape_size = tape.length;
    statistics.command_execution_time = performance.now() - statistics.command_execution_time;

    statistics.total_execution_time = performance.now() - statistics.total_execution_time;
    if (options.stats) {
        console.log(`
Brainfuck Interpreter Statistics:
-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

Program Information
-------------------
Program Path           : ${options.file}
Program Size           : ${statistics.code_input_size} character${statistics.code_input_size > 1 ? "s" : ""}
Executable Code Size   : ${statistics.executable_code_size} character${statistics.executable_code_size > 1 ? "s" : ""}
Program Load Time      : ${statistics.code_load_time.toFixed(2)} ms

Execution Statistics
--------------------
# of Commands Executed : ${statistics.number_of_commands_executed}
Command Execution Time : ${statistics.command_execution_time.toFixed(2)} ms
Total Execution Time   : ${statistics.total_execution_time.toFixed(2)} ms

Tape Information
----------------
Initial Tape Size      : ${statistics.initial_tape_size} cell${statistics.initial_tape_size > 1 ? "s" : ""}
Final Tape Size        : ${statistics.final_tape_size} cell${statistics.final_tape_size > 1 ? "s" : ""}
Maximum Tape Size      : ${statistics.max_tape_size} cell${statistics.max_tape_size > 1 ? "s" : ""}

Tape Configuration
------------------
Dynamic Tape           : ${options.dynamic_tape ? "enabled" : "disabled"}
Tape Wrapping          : ${options.tape_wrapping ? "enabled" : "disabled"}

Cell Configuration
------------------
Cell Size              : ${options.cell_size} bit${options.cell_size > 1 ? "s" : ""}
Cell Wrapping          : ${options.cell_wrapping ? "enabled" : "disabled"}

Debug Mode             : ${options.debug ? "enabled" : "disabled"}
`);
    }
    process.exit(0);
})();