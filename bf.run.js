#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

process.stdin.setEncoding("utf8");

const name = "Brainfuck Programming Language Suite - Interpreter";
const version = "1.0.0";
const author = "Kay Anar";
const repository = "https://github.com/c0d3rk1d/brainfuck-suite";

(async () => {
    let statistics = {
        "total_execution_time": performance.now(),
        "number_of_commands_executed": 0,
        "command_execution_time": 0,
        "max_memory_size": 0,
    };
    let options = {};
    const arguments = process.argv.slice(2);
    for (let i = 0; i < arguments.length; i++) {
        switch (arguments[i].toLowerCase()) {
            case "--version":
            case "-v":
            case "--help":
            case "-h":
                console.log(`${name}
Version ${version} by ${author}
${repository}`);
                if (arguments[i] === "--version" || arguments[i] === "-v") {
                    process.exit(0);
                }
                console.log(`
Usage:
  bf.run [options] <file>

  <file> Path to a file containing Brainfuck code to execute.

Options:
  --help, -h
      Display this help message and exit.

  --version, -v
      Display the version of the interpreter and exit.

  --code, -c <code>
      Execute Brainfuck code code passed as a string.
      Note: Cannot be used with a file argument.
      You must choose one or the other.
      Example: --code "+[----->+++<]>+++.+."

  --cell-size, -cs <8|16|32|64>
      Specify the bit size of each memory cell.
      Memory cells can be 8, 16, 32, or 64 bits unsigned integers.
      Default: 8
      Example: --cell-size 16

  --cell-wrapping, -cw <on|off>
      Enable or disable cell value wrapping.
      When enabled, values that go below 0 wrap to the maximum cell value,
      and values above the maximum cell value wrap to 0.
      Default: on
      Example: --cell-wrapping off

  --memory-size, -ms <number>
      Set the initial number of memory cells.
      When dynamic memory (--dynamic-memory) is enabled,
      memory will not shrink below this size.
      Default: 1
      Example: --memory-size 3000

  --memory-wrapping, -mw <on|off>
      Enable or disable memory pointer wrapping.
      When enabled, if the pointer moves below cell 0,
      it wraps to the last cell. If it moves beyond the last cell,
      it wraps to the first cell.
      Note: When dynamic memory (--dynamic-memory) is enabled,
      wrapping above the last cell is disabled.
      Default: off
      Example: --memory-wrapping on

  --dynamic-memory, -dm <on|off>
      Enable or disable dynamic memory resizing.
      When enabled, the memory can grow beyond the initial size
      specified by --memory-size but will never shrink below it.
      Note: When dynamic memory is enabled,
      pointer wrapping above the last memory cell is disabled,
      even if --memory-wrapping is on.
      Default: on
      Example: --dynamic-memory off

  --newline, -n
      Print a newline character after execution completes.

  --stats, -s
      Display execution statistics after program completes.

  --debug, -d
      Enable debug mode. When enabled, you can use the "#" command
      to print debug information such as the current debug index,
      total memory size, number of executed commands,
      and a memory dump centered around the pointer.`);
                process.exit(0);
            case "--code":
            case "-c":
                if (options.file || options.code) {
                    console.error(`Error: "${arguments[i]}" cannot be used when a code ${options.code ? "string" : "file"} is already specified.`);
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
                if (isNaN(cellSize) || (cellSize != 8 && cellSize != 16 && cellSize != 32 && cellSize != 64)) {
                    console.error(`Error: Parameter for "${arguments[i - 1]}" must be 8, 16, 32 or 64.`);
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
            case "--memory-size":
            case "-ms":
                if (options.memory_size) {
                    console.error(`Error: "${arguments[i]}" cannot be used when a memory size is already specified.`);
                    process.exit(1);
                }
                const memorySize = parseInt(arguments[++i], 10);
                if (isNaN(memorySize) || memorySize < 1) {
                    console.error(`Error: Parameter for "${arguments[i - 1]}" must be a number greater than 1.`);
                    process.exit(1);
                }
                options.memory_size = memorySize;
                statistics.max_memory_size = memorySize;
                break;
            case "--memory-wrapping":
            case "-mw":
                if (options.memory_wrapping) {
                    console.error(`Error: "${arguments[i]}" cannot be used when memory wrapping is already specified.`);
                    process.exit(1);
                }
                const memoryWrapping = `${arguments[++i]}`.toLowerCase();
                if (!["on", "off"].includes(memoryWrapping)) {
                    console.error(`Error: Parameter for "${arguments[i - 1]}" must be "on" or "off".`);
                    process.exit(1);
                }
                options.memory_wrapping = memoryWrapping === "on" || memoryWrapping === "1" || memoryWrapping === "true";
                break;
            case "--dynamic-memory":
            case "-dm":
                if (options.dynamic_memory) {
                    console.error(`Error: "${arguments[i]}" cannot be used when dynamic memory is already specified.`);
                    process.exit(1);
                }
                const dynamicTape = `${arguments[++i]}`.toLowerCase();
                if (!["on", "off"].includes(dynamicTape)) {
                    console.error(`Error: "${arguments[i - 1]}" must be "on" or "off".`);
                    process.exit(1);
                }
                options.dynamic_memory = dynamicTape === "on" || dynamicTape === "1" || dynamicTape === "true";
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
            "dynamic_memory": true,
            "memory_size": 1,
            "memory_wrapping": false,
            "stats": false,
        }, ...options
    };
    statistics.initial_memory_size = options.memory_size;
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
    let memoryPointer = 0;
    let memory;
    switch (options.cell_size) {
        case 8:
            memory = new Uint8Array(options.memory_size);
            break;
        case 16:
            memory = new Uint16Array(options.memory_size);
            break;
        case 32:
            memory = new Uint32Array(options.memory_size);
            break;
        case 64:
            memory = new BigUint64Array(options.memory_size);
            break;
    }
    const max_cell_value = Math.pow(2, options.cell_size);
    statistics.command_execution_time = performance.now();
    let codePointer = 0;
    while (codePointer < options.code.length) {
        statistics.number_of_commands_executed++;
        const command = options.code[codePointer];
        switch (command) {
            case ">":
                memoryPointer++;
                if (memoryPointer >= memory.length) {
                    if (options.dynamic_memory) {
                        memory = [...memory, 0];
                        if (memory.length > statistics.max_memory_size) {
                            statistics.max_memory_size = memory.length;
                        }
                    } else if (options.memory_wrapping) {
                        memoryPointer = 0;
                    } else {
                        console.error("Error: Tape pointer out of bounds. Use --memory-wrapping to enable wrapping or --dynamic-memory to allow dynamic memory growth.");
                        process.exit(1);
                    }
                }
                break;
            case "<":
                memoryPointer--;
                if (memoryPointer < 0) {
                    if (options.memory_wrapping) {
                        memoryPointer = memory.length - 1;
                    } else {
                        console.error("Error: Tape pointer out of bounds. Use --memory-wrapping to enable wrapping.");
                        process.exit(1);
                    }
                }
                break;
            case "+":
                memory[memoryPointer] = memory[memoryPointer] + 1;
                if (memory[memoryPointer] > max_cell_value) {
                    if (options.cell_wrapping) {
                        memory[memoryPointer] = 0;
                    } else {
                        console.error(`Error: Cell value exceeds maximum for ${options.cell_size}-bit cells. Use --cell-wrapping to enable wrapping.`);
                        process.exit(1);
                    }
                }
                break;
            case "-":
                memory[memoryPointer] = memory[memoryPointer] - 1;
                if (memory[memoryPointer] < 0) {
                    if (options.cell_wrapping) {
                        memory[memoryPointer] = max_cell_value - 1;
                    } else {
                        console.error(`Error: Cell value cannot be negative for ${options.cell_size}-bit cells. Use --cell-wrapping to enable wrapping.`);
                        process.exit(1);
                    }
                }
                break;
            case ".":
                process.stdout.write(String.fromCharCode(memory[memoryPointer]));
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
                memory[memoryPointer] = inputChar;
                process.stdout.write(String.fromCharCode(inputChar));
                if (memory[memoryPointer] >= Math.pow(2, options.cell_size)) {
                    if (options.cell_wrapping) {
                        memory[memoryPointer] = inputChar % Math.pow(2, options.cell_size);
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
                if (memory[memoryPointer] === 0) {
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
                if (memory[memoryPointer] !== 0) {
                    codePointer = loopPointer;
                }
                break;
            case "#":
                if (options.debug) {
                    console.log(`Debug: Pointer: ${codePointer}, Tape Pointer: ${memoryPointer}, Cell Value: ${memory[memoryPointer]}, Tape: [${memory.join(", ")}]`);
                }
                break;
            default:
                console.error(`Error: Unknown command "${command}" at position ${codePointer}.`);
                process.exit(1);
        }
        while (options.dynamic_memory && memory[memory.length - 1] == 0 && memoryPointer < memory.length - 1) {
            memory.pop();
        }
        codePointer++;
    }
    if (options.newline) {
        process.stdout.write("\n");
    }
    statistics.final_memory_size = memory.length;
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
Initial Tape Size      : ${statistics.initial_memory_size} cell${statistics.initial_memory_size > 1 ? "s" : ""}
Final Tape Size        : ${statistics.final_memory_size} cell${statistics.final_memory_size > 1 ? "s" : ""}
Maximum Tape Size      : ${statistics.max_memory_size} cell${statistics.max_memory_size > 1 ? "s" : ""}

Tape Configuration
------------------
Dynamic Tape           : ${options.dynamic_memory ? "enabled" : "disabled"}
Tape Wrapping          : ${options.memory_wrapping ? "enabled" : "disabled"}

Cell Configuration
------------------
Cell Size              : ${options.cell_size} bit${options.cell_size > 1 ? "s" : ""}
Cell Wrapping          : ${options.cell_wrapping ? "enabled" : "disabled"}

Debug Mode             : ${options.debug ? "enabled" : "disabled"}
`);
    }
    process.exit(0);
})();