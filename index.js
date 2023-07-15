const fs = require('fs');
const prompt = require('prompt-sync')();
const { table } = require('console.table');

const employeesFile = 'employees.json';
const timesheetsFile = 'timesheets.json';

function signIn() {
    console.log('Welcome to the Employee Time Clock System!');
    const employeeId = prompt('Please enter your employee ID: ');

    const employeesData = JSON.parse(fs.readFileSync(employeesFile, 'utf8'));

    const employee = employeesData.employees[employeeId];
    const manager = employeesData.managers[employeeId];
    if (employee) {
        console.log(`Welcome, ${employee.name}!`);
        employeeMenu(employee);
    } else if (manager) {
        console.log(`Welcome, ${manager.name}!`);
        managerMenu(manager);
    } else {
        console.log('Invalid employee ID. Please try again.');
        signIn();
    }
}

function employeeMenu(employee) {
    let option = '';
    while (true) {
        console.log('Please select an option:');
        console.log('1. Clock In');
        console.log('2. Clock In to Lunch');
        console.log('3. Clock Out of Lunch');
        console.log('4. Clock Out');
        console.log('5. Sign Out');
        console.log('6. Exit');
        option = prompt('Enter your choice: ');

        switch (option) {
            case '1':
                clockIn(employee);
                break;
            case '2':
                clockInToLunch(employee);
                break;
            case '3':
                clockOutOfLunch(employee);
                break;
            case '4':
                clockOut(employee);
                break;
            case '5':
                console.log('Signing out...');
                startApp();
                return;
            case '6':
                console.log('Exiting...');
                process.exit(0);
            default:
                console.log('Invalid option. Please try again.');
        }
    }
}

function managerMenu(manager) {
    let option = '';
    while (true) {
        console.log('Please select an option:');
        console.log('1. View Employee List');
        console.log('2. View Timesheets');
        console.log('3. Sign Out');
        console.log('4. Exit');
        option = prompt('Enter your choice: ');

        switch (option) {
            case '1':
                viewEmployeeList();
                break;
            case '2':
                viewTimesheets();
                break;
            case '3':
                console.log('Signing out...');
                startApp();
                return;
            case '4':
                console.log('Exiting...');
                process.exit(0);
            default:
                console.log('Invalid option. Please try again.');
        }
    }
}



function viewEmployeeList() {
    const employeesData = JSON.parse(fs.readFileSync(employeesFile, 'utf8'));
    const employees = Object.values(employeesData.employees);
    const managers = Object.values(employeesData.managers);
    const allEmployees = employees.concat(managers);

    console.log('Here is the list of employees:');
    console.table(allEmployees, ['id', 'name']);

    const selectedEmployee = prompt('Please enter the employee ID (or 0 to go back): ');
    if (selectedEmployee === '0') {
        managerMenu();
    } else {
        const selectedEmp = allEmployees.find(emp => emp.id === selectedEmployee);
        if (selectedEmp) {
            viewTimesheets(selectedEmp);
        } else {
            console.log('Invalid employee ID. Please try again.');
            viewEmployeeList();
        }
    }
}


function viewTimesheets() {
    const timesheetsData = JSON.parse(fs.readFileSync(timesheetsFile, 'utf8'));
    const employeesData = JSON.parse(fs.readFileSync(employeesFile, 'utf8'));
    console.log('Timesheets for all employees:');
    for (const employeeId in timesheetsData) {
        const employee = employeesData.employees[employeeId];
        const timesheets = timesheetsData[employeeId];
        console.log(`Timesheets for ${employee.name}:`);
        console.table(timesheets);
        console.log('-----------------------------------');
    }

    prompt('Press any key to go back.');
    managerMenu();
}

function clockIn(employee) {
    const currentTime = new Date().toLocaleTimeString();
    const timesheetEntry = {
        date: new Date().toISOString().slice(0, 10),
        clockIn: currentTime,
        lunchStart: '',
        lunchEnd: '',
        clockOut: ''
    };

    const timesheetsData = JSON.parse(fs.readFileSync(timesheetsFile, 'utf8'));
    timesheetsData[employee.id] = timesheetsData[employee.id] || [];
    timesheetsData[employee.id].push(timesheetEntry);

    fs.writeFileSync(timesheetsFile, JSON.stringify(timesheetsData), 'utf8');
    console.log(`You have clocked in at ${currentTime}.`);
}

function clockInToLunch(employee) {
    const currentTime = new Date().toLocaleTimeString();

    const timesheetsData = JSON.parse(fs.readFileSync(timesheetsFile, 'utf8'));
    timesheetsData[employee.id] = timesheetsData[employee.id] || [];
    const employeeTimesheets = timesheetsData[employee.id];
    const lastEntry = employeeTimesheets[employeeTimesheets.length - 1];
    lastEntry.lunchStart = currentTime;

    fs.writeFileSync(timesheetsFile, JSON.stringify(timesheetsData), 'utf8');
    console.log(`You have clocked in to lunch at ${currentTime}.`);
}

function clockOutOfLunch(employee) {
    const currentTime = new Date().toLocaleTimeString();

    const timesheetsData = JSON.parse(fs.readFileSync(timesheetsFile, 'utf8'));
    timesheetsData[employee.id] = timesheetsData[employee.id] || [];
    const employeeTimesheets = timesheetsData[employee.id];
    const lastEntry = employeeTimesheets[employeeTimesheets.length - 1];
    lastEntry.lunchEnd = currentTime;

    fs.writeFileSync(timesheetsFile, JSON.stringify(timesheetsData), 'utf8');
    console.log(`You have clocked out of lunch at ${currentTime}.`);
}

function clockOut(employee) {
    const currentTime = new Date().toLocaleTimeString();

    const timesheetsData = JSON.parse(fs.readFileSync(timesheetsFile, 'utf8'));
    timesheetsData[employee.id] = timesheetsData[employee.id] || [];
    const employeeTimesheets = timesheetsData[employee.id];
    const lastEntry = employeeTimesheets[employeeTimesheets.length - 1];
    lastEntry.clockOut = currentTime;

    fs.writeFileSync(timesheetsFile, JSON.stringify(timesheetsData), 'utf8');
    console.log(`You have clocked out at ${currentTime}.`);
}

function startApp() {
    signIn();
}

startApp();
