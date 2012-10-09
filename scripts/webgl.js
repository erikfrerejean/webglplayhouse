(function($) {
	"use strict";

	var
		webgl = {
			animation: {},
			buffers:   {},
			context:   {},
			drawing:   {},
			helpers:   {},
			matrix:    {},
			shaders:   {},
			utils:     {},

			draw: function()
			{
				this.buffers.initAllBuffers();
				this.drawing.paint();
			},

			init: function(canvas)
			{
				try
				{
					this.context = canvas.getContext("experimental-webgl");
					this.context.viewportWidth = canvas.width;
					this.context.viewportHeight = canvas.height;
				}
				catch(e)
				{
					this.utils.showError("Couldn't initialise WebGL [" + e.message + "]");
				}
			},

			run: function()
			{
				requestAnimFrame(webgl.run);
				webgl.buffers.initAllBuffers();
				webgl.drawing.paint();
				webgl.animation.rotation();
			}
		};

	// The webgl.animation Object
	webgl.animation.rotationLastTime = 0;

	webgl.animation.rotation = function()
	{
		var _current = new Date().getTime(),
		    _elapsed = _current - this.rotationLastTime,
		    _o,
		    _rotation = 0,
		    _sortedKeys = webgl.drawing.objects.getKeys();

		for (var oKey in _sortedKeys)
		{
			_o = webgl.drawing.objects.get(_sortedKeys[oKey]);

			if (typeof(_o.rotation) === "undefined")
			{
				continue;
			}

			if (this.rotationLastTime > 0)
			{
				if ($.isArray(_o.rotation))
				{
					for (var i in _o.rotation)
					{
						_rotation = (_o.rotation[i].deg * _elapsed) / 1000.0;
						_o.rotation[i].cur = (_o.rotation[i].dir == "-") ? _o.rotation[i].cur - _rotation : _o.rotation[i].cur + _rotation;
					}
				}
				else
				{
					_rotation = (_o.rotation.deg * _elapsed) / 1000.0;
					_o.rotation.cur = (_o.rotation.dir == "-") ? _o.rotation.cur - _rotation : _o.rotation.cur + _rotation;
				}
			}
		}

		this.rotationLastTime = _current;
	}

	// The webgl.buffers Object
	webgl.buffers.createArrayBuffer = function(bufferData, itemSize, numItems)
	{
		var _buffer = webgl.context.createBuffer();

		webgl.context.bindBuffer(webgl.context.ARRAY_BUFFER, _buffer);
		webgl.context.bufferData(
			webgl.context.ARRAY_BUFFER,
			new Float32Array(bufferData), 
			webgl.context.STATIC_DRAW
		);

		_buffer.itemSize = itemSize;
		_buffer.numItems = numItems;

		return _buffer;
	}

	webgl.buffers.createElementArrayBuffer = function(bufferData, itemSize, numItems)
	{
		var _buffer = webgl.context.createBuffer();

		webgl.context.bindBuffer(webgl.context.ELEMENT_ARRAY_BUFFER, _buffer);
		webgl.context.bufferData(
			webgl.context.ELEMENT_ARRAY_BUFFER,
			new Uint16Array(bufferData), 
			webgl.context.STATIC_DRAW
		);

		_buffer.itemSize = itemSize;
		_buffer.numItems = numItems;

		return _buffer;
	}

	webgl.buffers.createColourBuffer = function(name, drawObject, override)
	{
/*
		if (typeof(this.colourObjects.get(name)) !== "undefined" && override !== true)
		{
			return;
		}

		alert("create buffer! [" + name + "]");
*/
		if (typeof(drawObject.unPackColour) !== "undefined")
		{
			drawObject.unPackColour();
		}

		this.colourObjects.set(
			name, 
			this.createArrayBuffer(
				drawObject.colour,
				drawObject.colourItemSize,
				drawObject.colourNumItems
			)
		);
	}

	webgl.buffers.createIndexBuffer = function(name, drawObject)
	{
		this.indexObjects.set(
			name,
			this.createElementArrayBuffer(
				drawObject.indexes,
				drawObject.indexesItemSize,
				drawObject.indexesNumItems
			)
		);
	}

	webgl.buffers.createPositionBuffer = function(name, drawObject, override)
	{
/*
		if (typeof(this.positionObjects.get(name)) !== "undefined" && override !== true)
		{
			return;
		}
*/
		this.positionObjects.set(
			name,
			this.createArrayBuffer(
				drawObject.vertices,
				drawObject.verticesItemSize,
				drawObject.verticesNumItems
			)
		);
	}

	webgl.buffers.initAllBuffers = function()
	{
		// Create buffers for all the objects
		var _o,
		    _keys = webgl.drawing.objects.getKeys();

		for (var oKey in _keys)
		{
			_o = webgl.drawing.objects.get(_keys[oKey]);

			if (typeof(_o.colour) !== "undefined")
			{
				this.createColourBuffer(_keys[oKey], _o);
			}

			if (typeof(_o.indexes) !== "undefined")
			{
				this.createIndexBuffer(_keys[oKey], _o);
			}

			if (typeof(_o.vertices) !== "undefined")
			{
				this.createPositionBuffer(_keys[oKey], _o);
			}
		}
	}

		// The webgl.drawing.objects Object
		webgl.buffers.positionObjects = {
			keys:	[],
			hashes:	{},

			get: function(key)
			{
				return this.hashes[key];
			},

			set: function(key, value, override)
			{
				override = (typeof override === 'undefined') ? false : override;

				if (typeof(this.hashes[key]) === "undefined")
				{
					this.keys.push(key);
				}
				else if (!override)
				{
					return;
				}

				this.hashes[key] = value;
			},

			getKeys: function()
			{
				return this.keys();
			}
		}
		// The webgl.drawing.indexObjects Object
		webgl.buffers.indexObjects = {
			keys:	[],
			hashes:	{},

			get: function(key)
			{
				return this.hashes[key];
			},

			set: function(key, value, override)
			{
				override = (typeof override === 'undefined') ? false : override;

				if (typeof(this.hashes[key]) === "undefined")
				{
					this.keys.push(key);
				}
				else if (!override)
				{
					return;
				}

				this.hashes[key] = value;
			},

			getKeys: function()
			{
				return this.keys();
			}
		}
		// The webgl.drawing.objects Object
		webgl.buffers.colourObjects = {
			keys:	[],
			hashes:	{},

			get: function(key)
			{
				return this.hashes[key];
			},

			set: function(key, value, override)
			{
				override = (typeof override === 'undefined') ? false : override;

				if (typeof(this.hashes[key]) === "undefined")
				{
					this.keys.push(key);
				}
				else if (!override)
				{
					return;
				}

				this.hashes[key] = value;
			},

			getKeys: function()
			{
				return this.keys();
			}
		}

	// the webgl.drawing Object
	webgl.drawing.paint = function()
	{
		webgl.context.viewport(0, 0, webgl.context.viewportWidth, webgl.context.viewportHeight);
		webgl.context.clear(webgl.context.COLOR_BUFFER_BIT | webgl.context.DEPTH_BUFFER_BIT);

		mat4.perspective(45, webgl.context.viewportWidth / webgl.context.viewportHeight, 0.1, 100.0, webgl.matrix.pMatrix);
		mat4.identity(webgl.matrix.mvMatrix);

		// Draw the objects
		var _cB = null,	// Current colour buffer
		    _iB = null, // Current index buffer
		    _pB = null, // Current position buffer
		    _o  = null, // Current draw object
		    _sortedKeys = this.objects.getKeys();

		for (var oKey in _sortedKeys)
		{
			_cB = webgl.buffers.colourObjects.get(_sortedKeys[oKey]);
			_iB = webgl.buffers.indexObjects.get(_sortedKeys[oKey]);
			_pB = webgl.buffers.positionObjects.get(_sortedKeys[oKey]);
			_o  = this.objects.get(_sortedKeys[oKey]);

			mat4.translate(webgl.matrix.mvMatrix, _o.translate);

			webgl.matrix.push();

			// Rotate the objects
			if (typeof(_o.rotation) !== "undefined")
			{
				if ($.isArray(_o.rotation))
				{
					for (var i in _o.rotation)
					{
						mat4.rotate(
							webgl.matrix.mvMatrix,
							webgl.helpers.degToRad(_o.rotation[i].cur),
							_o.rotation[i].vec
						);
					}
				}
				else
				{
					mat4.rotate(
						webgl.matrix.mvMatrix,
						webgl.helpers.degToRad(_o.rotation.cur),
						_o.rotation.vec
					);
				}
			}

			webgl.context.bindBuffer(webgl.context.ARRAY_BUFFER, _pB);
			webgl.context.vertexAttribPointer(
				webgl.shaders.program.vertexPositionAttribute,
				_pB.itemSize,
				webgl.context.FLOAT,
				false,
				0,
				0
			);

			if (typeof(_o.colour) !== "undefined")
			{
				webgl.context.bindBuffer(webgl.context.ARRAY_BUFFER, _cB);
				webgl.context.vertexAttribPointer(
					webgl.shaders.program.vertexColourAttribute,
					_cB.itemSize,
					webgl.context.FLOAT,
					false,
					0,
					0
				);
			}

			if (_o.drawOptions.callback == 'drawArrays')
			{
				webgl.matrix.setMatrixUniforms();
				webgl.context.drawArrays(_o.drawOptions.type, 0, _pB.numItems);
			}
			else if (_o.drawOptions.callback == 'drawElements')
			{
				webgl.context.bindBuffer(webgl.context.ELEMENT_ARRAY_BUFFER, _iB);
				webgl.matrix.setMatrixUniforms();
				webgl.context.drawElements(
					_o.drawOptions.type,
					_iB.numItems,
					webgl.context.UNSIGNED_SHORT,
					0
				);
			}

			webgl.matrix.pop();
		}

		webgl.utils.showError("Draw finished");
	}

		// The webgl.drawing.objects Object
		webgl.drawing.objects = {
			keys:	[],
			hashes:	{},

			get: function(key)
			{
				return this.hashes[key];
			},

			set: function(key, value, override)
			{
				override = (typeof override === 'undefined') ? false : override;

				if (typeof(this.hashes[key]) === "undefined")
				{
					this.keys.push(key);
				}
				else if (!override)
				{
					return;
				}

				this.hashes[key] = value;
			},

			getKeys: function()
			{
				return this.keys;
			}
		}

	// The webgl.helpers Object
	webgl.helpers.degToRad = function(degrees)
	{
		return degrees * Math.PI / 180;
	}

	// The webgl.matrix Object
	webgl.matrix.mvMatrix		= mat4.create();
	webgl.matrix.mvMatrixStack	= []
    webgl.matrix.pMatrix		= mat4.create();

    webgl.matrix.setMatrixUniforms = function()
    {
		webgl.context.uniformMatrix4fv(webgl.shaders.program.pMatrixUniform, false, this.pMatrix);
		webgl.context.uniformMatrix4fv(webgl.shaders.program.mvMatrixUniform, false, this.mvMatrix);
	}

	webgl.matrix.push = function()
	{
		var _copy = mat4.create();
		mat4.set(this.mvMatrix, _copy);
		this.mvMatrixStack.push(_copy);
	}

	webgl.matrix.pop = function()
	{
		if (this.mvMatrixStack.length == 0)
		{
			webgl.utils.showError("Invalid popMatrix!");
		}

		this.mvMatrix = this.mvMatrixStack.pop();
	}

	// The webgl.shaders Object
	webgl.shaders.program = {}

	webgl.shaders.init = function(fragmentShaderID, vertexShaderID)
	{
		var _fragmentShader	= this.fetchShader(fragmentShaderID),
		    _vertexShader	= this.fetchShader(vertexShaderID);

		this.program = webgl.context.createProgram();
		webgl.context.attachShader(this.program, _fragmentShader);
		webgl.context.attachShader(this.program, _vertexShader);
		webgl.context.linkProgram(this.program);

		if (!webgl.context.getProgramParameter(this.program, webgl.context.LINK_STATUS))
		{
			webgl.utils.showError("Couldn't initialise shaders");
		}


		webgl.context.useProgram(this.program);

		this.program.vertexPositionAttribute = webgl.context.getAttribLocation(this.program, "aVertexPosition");
		webgl.context.enableVertexAttribArray(this.program.vertexPositionAttribute);

		this.program.pMatrixUniform		= webgl.context.getUniformLocation(this.program, "uPMatrix");
		this.program.mvMatrixUniform	= webgl.context.getUniformLocation(this.program, "uMVMatrix");
	}

	webgl.shaders.initColour = function(fragmentShaderID, vertexShaderID)
	{
		this.init(fragmentShaderID, vertexShaderID);

		this.program.vertexColourAttribute = webgl.context.getAttribLocation(this.program, "aVertexColor");
		webgl.context.enableVertexAttribArray(this.program.vertexColourAttribute);
	}

	webgl.shaders.fetchShader = function(eleID)
	{
		var _shaderElement = $("#" + eleID);
		if (!_shaderElement)
		{
			webgl.utils.showError("Couldn't load shader [" + eleID + "]");
			return null;
		}

		var _shaderConstruct = null,
		    _shaderType = _shaderElement.attr('type'),
		    _shaderScript = _shaderElement.text();

		if (_shaderType == "x-shader/x-fragment")
		{
			_shaderConstruct = webgl.context.FRAGMENT_SHADER;
		}
		else if (_shaderType == "x-shader/x-vertex")
		{
			_shaderConstruct = webgl.context.VERTEX_SHADER;
		}
		else
		{
			webgl.utils.showError("Unsupported shader type [" + _shaderType + "]");
			return null;
		}

		var _shader = webgl.context.createShader(_shaderConstruct);
		webgl.context.shaderSource(_shader, _shaderScript);
		webgl.context.compileShader(_shader);

		if (!webgl.context.getShaderParameter(_shader, webgl.context.COMPILE_STATUS))
		{
			webgl.utils.showError(webgl.context.getShaderInfoLog(_shader));
			return null;
		}

		return _shader;
	}

	// The utils object
	webgl.utils.showElement		= function(ele)
	{
		if (ele.is(":hidden"))
		{
			this._toggleElement(ele, true);
		}
	}

	webgl.utils.hideElement		= function(ele)
	{
		if (ele.is(":hidden"))
		{
			this._toggleElement(ele, false);
		}
	}

	webgl.utils._toggleElement	= function(ele, show)
		{
			show ? ele.removeClass("hidden") : ele.addClass("hidden");
		},

	webgl.utils.showError		= function(message)
	{
		var box = $("#errorbox");
		webgl.utils.showElement(box);
		$("#errortext").text(message);
	}

	// Expose `webgl` to the global scope
	window.webgl = webgl

})(jQuery);
