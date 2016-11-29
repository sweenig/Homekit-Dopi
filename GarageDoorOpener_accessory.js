//START SETUP
var garageName = 'Garage Door';
var uuidTag = 'garage';
var relaypin = 26;
var sensor1pin = 12;
// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
var username = "C1:5D:3F:EE:5E:FA"; //edit this if you use Core.js
var pincode = "031-45-154"
//END SETUP
var Accessory = require('../').Accessory;var Service = require('../').Service;var Characteristic = require('../').Characteristic;var uuid = require('../').uuid;var cmd=require('node-cmd'); //add some required stuff
var wpi = require('wiring-pi');wpi.setup('phys'); //setup the WiringPi object (and use physical numbering?)
wpi.pinMode(relaypin,wpi.OUTPUT); //setup the output pin
var newStatus;
function pushbutton() {
	wpi.digitalWrite(relaypin,1); //output a 1 (turn on the button relay, e.g. hit the button)
	setTimeout(function() {
		wpi.digitalWrite(relaypin,0);
	}, 300); //wait 300ms then output a 0 (e.g. let go of the button)
}
function readsensor() {return Number(wpi.digitalRead(sensor1pin));} //read the value from pin sensor1pin
var GARAGE_DOOR = { //create the garage door class?
	opened: false, //initially set the door to closed
	open: function() {pushbutton();GARAGE_DOOR.opened = true;}, //method to open the garage door
	close: function() {pushbutton();GARAGE_DOOR.opened = false;}, //method to close the garage door
	identify: function() {console.log("Identify the Garage");} //method to be executed to blink an LED or something when HomeKit issues an identify command.
};
var garage = exports.accessory = new Accessory(garageName, uuid.generate('hap-nodejs:accessories:'+uuidTag); //create the garage door instance
garage
	.username = username;
	.pincode = pincode;
	.on('identify', function(paired, callback) {GARAGE_DOOR.identify();callback();}); //execute GARAGE_DOOR.identify() method when HomeKit issues an identify command
	.addService(Service.GarageDoorOpener, "Garage Door") //connect to HomeKit?
	.setCharacteristic(Characteristic.TargetDoorState, Characteristic.TargetDoorState.CLOSED) //create the TargetDoorState and force initial target state to CLOSED
	.getCharacteristic(Characteristic.TargetDoorState) //read the requested state
	.on('set', function(value, callback) { //upon some type of request
		if (value == Characteristic.TargetDoorState.CLOSED) {GARAGE_DOOR.close();callback();} //if a closure was requested, close the door
		else if (value == Characteristic.TargetDoorState.OPEN) {GARAGE_DOOR.open();callback();} //if an open was requested, open the door
	});
	.getService(Service.GarageDoorOpener)
	.getCharacteristic(Characteristic.CurrentDoorState)
	.on('get', function(callback) {
		var err = null;
		if (readsensor() == '1'){GARAGE_DOOR.opened = false;} //if the switch reads 1, the garage door is closed.
		else {GARAGE_DOOR.opened = true;} //if the switch does not read 1, the garage door is not closed (open or opening)
		if (GARAGE_DOOR.opened) {callback(err, Characteristic.CurrentDoorState.OPEN);} //return a status of open
		else {callback(err, Characteristic.CurrentDoorState.CLOSED);} //return a status of closed
	});
setInterval(function() {
	if (readsensor() == '1'){newStatus = false;} //if the switch reads a 1, the garage door is closed. Set newStatus to false for storing in the .opened characteristic
	else {newStatus = true;} //if the switch does not read a 1, the garage door is not closed (opening or opened)
	if (newStatus != GARAGE_DOOR.opened){ //if the new status (just read) is different than the stored status
		GARAGE_DOOR.opened = newStatus; //set the opened characteristic to the newly read status
		garage
			.getService(Service.GarageDoorOpener) //connect to HomeKit?
			.setCharacteristic(Characteristic.CurrentDoorState, GARAGE_DOOR.opened); //update HomeKit
	}
}, 1000);
