var express = require("express"),
		logger = require("commonlog-bunyan").logger,
		logStream = {
			write: function (message, encoding) {
				logger.info(message.slice(0, -1));
			}
		};

module.exports = function (app, config) {
	app.use(express.favicon("public/favicon.ico"));
	app.use(express.logger({ stream: logStream }));
	app.set('views', config.root + '/app/views')
  app.set('view engine', 'jade')

	app.configure(function() {
		app.enable('trust proxy');
		app.disable('x-powered-by');
		app.use(express.bodyParser());
		app.use(app.router);
		app.use(function (error, request, response, next) {
			var message = "Something went wrong: " + error.message;
			
			if (config.env !== "test") {
				console.log(error.stack);	
			}
			
			if (config.env === "production") {
				message = "500 Error. Oooomph!";
			}

			response.send(500, message);
			
			logger.error({error: error, stack: error.stack});
		});
		app.use(function (request, response) {
			response.status(404).render("404");
		});
	});
}