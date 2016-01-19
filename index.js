module.exports = init;

var SunCalc = require('suncalc');
var Service = null;
var Characteristic = null;


function init(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-sun', 'Sun', Sun);
}

function Sun(log, config) {
  this.log = log;
  this.latitude = config.latitude;
  this.longitude = config.longitude;
  this.name = config.name;
}

Sun.prototype = {
	
  setPowerState: function(powerOn, callback) {
	  callback(false);
  },

  identify: function(callback) {
    this.log("Identify requested!");
    callback(); // success
  },
  
  getPowerState: function(callback) {
	var log = this.log;
	
	var now = new Date();
	
	var times = SunCalc.getTimes(now, Number(this.latitude), Number(this.longitude));
	
	log("Sunrise:" + times.sunrise.getHours() + ':' + times.sunrise.getMinutes() + "; " +
	    "Sunset:" + times.sunset.getHours() + ':' + times.sunset.getMinutes() + "; " +
	    "Now:" + now.getHours() + ':' + now.getMinutes());
	
	if (now > times.sunrise && now <= times.sunset) {
		log("Sun is up");
		callback(null,1);
	} else {
		log("Sun is down");
		callback(null,0);
	}
  },

  getServices: function() {

    var informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Sun")
      .setCharacteristic(Characteristic.Model, "Sun")
      .setCharacteristic(Characteristic.SerialNumber, "Solaris");

    var switchService = new Service.Switch(this.name);

    switchService.getCharacteristic(Characteristic.On)
	  .on('get', this.getPowerState.bind(this))
      .on('set', this.setPowerState.bind(this));

    return [informationService, switchService];
  }
};
