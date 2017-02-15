// https://github.com/jquery-boilerplate/jquery-boilerplate/wiki/Extending-jQuery-Boilerplate

/*
 *  Project: Lava Read More Truncate
 *  Description: Better truncating with ellipsis
 *  Author: Rúni Lava Olsen
 *  License: What?
 */
;(function ( $, window, document, undefined ) {
	var pluginName = 'lava_read_more_truncate',
        defaults = {
            line_count: 3,
			ellipsis: '...',
			animation_speed: 200,
			responsive: true,
			responsive_speed: 100,
			line_height: '120%', // CSS would override this default
			open_link: '<a href="#" class="open truncate_toggle_link">Read more</a>', // HTML tag string
			close_link: '<a href="#" class="close truncate_toggle_link">Read less</a>', // HTML tag string
			append_toggle_links: true // Whether or not to display open/close links beneath the truncated text
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;
		this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype.init = function () {
        // Place initialization logic here
        // You already have access to the DOM element and the options via the instance,
        // e.g., this.element and this.options
		
		var options = this.options;
		Plugin.prototype.options = options;
		var truncate_clone = this.get_truncate_clone($('#'+this.options.this_id));
		var normal_height = $('#'+this.options.this_id).outerHeight(true);
		var normal_width = $('#'+this.options.this_id).width();
		
		$('#'+this.options.this_id).data('options', options);
		
		// Set line-height if thre is none
		if( !$('#'+this.options.this_id).css('lineHeight') ) {
			$('#'+this.options.this_id).css('lineHeight', this.options.line_height);
		}
		
		var truncate_holder = $('<div class="truncate_holder closed"></div>');
		$('#'+this.options.this_id).css('display', 'none').wrap(truncate_holder);
		$('#'+this.options.this_id).closest('.truncate_holder').wrap('<div class="truncate_item closed"></div>');
		truncate_holder = $('#'+this.options.this_id).closest('.truncate_holder');
		truncate_holder.attr('data-width', normal_width);
		truncate_clone.insertBefore($('#'+this.options.this_id));
		
		var target_height = this.get_target_height($('#'+this.options.this_id), truncate_clone, options);
		truncate_holder.attr('data-target_height', target_height).attr('data-normal_height', normal_height);
		truncate_holder.css({
			height: target_height+'px',
			overflow: 'hidden'
		});
		
		if( options.append_toggle_links ) {
			var open_link = $(options.open_link);
			var close_link = $(options.close_link);
			
			if( close_link.length ) {
				close_link.on('click touchend', function() {
					if( $(this).parent().find('.truncate_holder').hasClass('opened') ) {
						Plugin.prototype.toggle('close', $(this).parent().find('.truncate.real'), options);
					}
				});
				close_link.insertAfter(truncate_holder);
			}
			
			if( open_link.length ) {
				open_link.on('click touchend', function() {
					if( $(this).parent().find('.truncate_holder').hasClass('closed') ) {
						Plugin.prototype.toggle('open', $(this).parent().find('.truncate.real'), options);
					}
				});
				open_link.insertAfter(truncate_holder);
			}
		}
		
		if( this.options.responsive ){
            var this_truncate_holder = false;
			$(this).each(function() {
				this_truncate_holder = $('#'+this.options.this_id).closest('.truncate_holder');
				this.responsive_resize(this_truncate_holder, options);
			});
			
			
        }
    };
	
	Plugin.prototype.responsive_resize = function(truncate_holder, options) {
		var the_real = truncate_holder.find('.real');
		
		if( the_real.data('options') ) {
			var options = the_real.data('options');
		} else {
			var options = options;
		}
		
		if( options.responsive ){
			var doit;
			$(window).on('resize', function() {
				if( truncate_holder.attr('class').indexOf('opened') == -1 ){
                    // Only do something if the width of the element has changed
					if( truncate_holder.width() != truncate_holder.attr('data-width') ) {
						clearTimeout(doit);
						doit = setTimeout(function() {
							truncate_holder.attr('data-width', truncate_holder.width());
							Plugin.prototype.re_truncate(truncate_holder);
						},options.responsive_speed);
					}
                } else {
					truncate_holder.css('height', 'auto');
					truncate_holder.attr('data-normal_height', truncate_holder.height());
				}
			});
        }
	}
	
	// Messy, very messy.
	Plugin.prototype.re_truncate = function(truncate_holder) {
		var this_elem = truncate_holder.find('.real');
		truncate_holder.css('height', 'auto');
		this_elem.css('display', 'block');
		var this_ellipsis = this_elem.parent().find('.ellipsis');
		this_elem.parent().find('.truncate.clone').remove();
		
		var new_normal_height = truncate_holder.height();
		truncate_holder.attr('data-normal_height', new_normal_height);
		var new_truncate_clone = this.get_truncate_clone(this_elem, this_ellipsis);
		truncate_holder.css('height', truncate_holder.attr('data-target_height')+'px');
		
		new_truncate_clone.insertAfter(this_elem);
		this_elem.css('display', 'none');
	}
	
	Plugin.prototype.animate_height = function(elem, height, callback) {
		if( elem.find('.real').data('options') ) {
			var options = elem.find('.real').data('options');
		} else {
			var options = this.options;
		}
		
		elem.stop().animate({
			height: height
		}, options.animation_speed, function() {
			// Animation complete.
			if( $.isFunction(callback) ) {
				callback();
			}
		});
	};
	
	Plugin.prototype.toggle = function(method='toggle', elem=false, options) {
		var elem_type = '';
		var the_elem = false;
		if( elem === false ) {
			elem_type = 'native';
			the_elem = $(this.element);
		} else {
			elem_type = 'jquery';
			the_elem = $(elem);
		}
		var truncate_holder = the_elem.closest('.truncate_holder');
		var truncate_clone = truncate_holder.find('.truncate.clone');
		var truncate_item = truncate_holder.closest('.truncate_item');
		
		var height = 0;
		var callback = false;
		switch ( method ) {
			default: 
				height = 0;
				break;
			case 'open':
				height = truncate_holder.attr('data-normal_height');
				the_elem.css('display', 'block');
				truncate_clone.css('display', 'none');
				truncate_item.addClass('opening');
				callback = function() {
					truncate_holder.removeClass('closed').addClass('opened');
					truncate_item.removeClass('closed').removeClass('opening').addClass('opened');
				};
				break; 
			case 'close':
				height = truncate_holder.attr('data-target_height');
				truncate_item.addClass('closing');
				callback = function() {
					the_elem.css('display', 'none');
					truncate_clone.css('display', 'block');
					truncate_holder.removeClass('opened').addClass('closed');
					truncate_item.removeClass('opened').addClass('closed').removeClass('closing');
					Plugin.prototype.re_truncate(truncate_holder);
				}
		}
		
		Plugin.prototype.animate_height(truncate_holder, height, callback, options);
	}
	
	Plugin.prototype.get_truncate_clone = function(elem, ellipsis) {
		elem = $(elem);
		
		if( elem.hasClass('real') ) {
			// This is a retruncate
		} else {
			ellipsis = this.options.ellipsis;
		}
		
		elem.addClass('truncate real');
		
		
		
		var rand = this.guidGenerator();
		// Add class to ellipsis. Make it in to jquery object if it isn't one
		// Any html in ellipsis string?
		var test = $('<span></span>');
		test.append(ellipsis);
		if( !test.children().length ) {
			// No?
			ellipsis = $('<span class="ellipsis generated">'+ellipsis+'</span>');
		}
		ellipsis = $(ellipsis).addClass(rand);
		
		// Create clone to truncate
		var clone = elem.clone(true, true).attr('data-id', elem.attr('id')).removeAttr('id').removeClass('real');
		clone.html('').addClass('clone');
		// Insert newly created element into document, as to get the height of it
		clone.insertBefore(elem);
		
		// Get height of truncated elem by calculating total line-height and other top-height on elem
		var target_height = this.get_target_height(elem, clone);
		console.log('-----target_height = '+target_height);
		// Get nodes array
		var nodes = this.get_element_nodes(elem);
		
		// Add nodes from array to clone, until elem has reached the height, or gone above the target height
		$.each(nodes, function( index ) {
			if( clone.outerHeight() <= target_height ) {
				clone.find('.'+rand).remove();
				clone.append(nodes[index][1]);
				clone.append(ellipsis);
			} else {
				// Terminate each loop
				return false;
			}
		});
		
		// We don't need a line break just before the ellipsis
		if( clone[0].lastChild.previousSibling.nodeName == 'BR' ) {
			clone[0].removeChild(clone[0].lastChild.previousSibling);
		}
		
		// Last node may consist of multiple words
		// Last node may span over several lines of text
		
		if( clone.outerHeight() > target_height ) {
			// The last node before ellipsis is the reason for too much text
			var culprit = clone[0].lastChild.previousSibling;
			// Remove culprit node from clone
			clone[0].removeChild(culprit);
			
			// Proccess culprit... Check if text or elem node, check if multiple words...
			if( culprit.nodeType == Node.TEXT_NODE ) {
				// Check if only a single word or multiple
				var culprit_temp_str = culprit.textContent;
				if( culprit_temp_str.trim().indexOf(' ') != -1 ) {
					// Split the text in to array of words
					var arr_of_words = this.node_text_to_elems(culprit, 'last_node_span');
					// Loop array and append span-wrapped words followed by ellipsis, until target height is reached
					$.each(arr_of_words, function( index ) {
						if( clone.outerHeight() <= target_height ) {
							clone.append(arr_of_words[index]);
							clone.find('.'+rand).remove();
							clone.append(ellipsis);
						} else {
							return false
						}
						
					});
					// If there's still a problem, the last word or element must be the final culprit
					if( clone.outerHeight() > target_height ) {
						clone.find('.last_node_span:last').remove();
					}
				}
				
			} else {
				// Node is elem... already removed from clone.
				// Probably a word or sentence wrapped in a span, or just a br
				// Don't want to deal with it
			}
		} else {
			// elem probably isn't high enough to have ellipsis
			if( clone.outerHeight() == elem.outerHeight() ) {
				elem.addClass('truncate_not_needed');
			}
		}
		
		clone.remove();
		//clone.find('.'+rand).remove();
		clone.find('.last_node_span').each(function() {
			$(this).replaceWith(this.childNodes);
		});
		
		return clone;
	};
	
	Plugin.prototype.node_text_to_elems = function(node, class_name) {
		var line_split_arr = node.textContent.split("\n");
		var i = 0;
		var len = line_split_arr.length
		var new_elems = new Array();
		while( i < len ) {
			var this_line = line_split_arr[i];
			var this_line_words = this_line.split(' ');
			var i2 = 0;
			var len2 = this_line_words.length;
			while( i2 < len2 ) {
				new_elems.push('<span class="'+class_name+'">'+this_line_words[i2]+' </span>');
				i2++;
			}
			i++;
		}
		
		if( new_elems.length ) {
			return new_elems;
		} else {
			return false;
		}
	};
	
	Plugin.prototype.get_element_nodes = function(elem) {
		elem = $(elem);
		var nodes = new Array();
		var elem_count = 0;
		elem.contents().each(function( index ) {
			if( this.nodeType == Node.TEXT_NODE ) {
				nodes.push(['text', this.textContent]);
			} else if( this.nodeType == Node.ELEMENT_NODE ) {
				if( elem_count == 0 ) {
					nodes.push(['elem', $(this).addClass('first_elem_node').clone(true, true)]);
				} else {
					nodes.push(['elem', $(this).clone(true, true)]);
				}
				elem_count++;
			}
		});
		
		if( nodes.length > 0 ) {
			return nodes;
		} else {
			return false;
		}
	};
	
	Plugin.prototype.get_target_height = function(elem, clone) {
		elem = $(elem);
	
		if( elem.data('options') ) {
			var options = elem.data('options');
		} else {
			var options = this.options;
		}
		// CHeck if clone elem has a set css line-height
		if( clone.css('line-height') != null ) {
			var line_height = clone.css('lineHeight').replace(/[^-\d\.]/g, '');
		} else {
			// Else try to get line-height from elem to be truncated
			var line_height = elem.css('lineHeight').replace(/[^-\d\.]/g, '');
		}
		
		if( !line_height.length ) {
			// Set some default line height, if none exists on the element
			elem.css('line-height', options.line_height);
			clone.css('line-height', options.line_height);
			line_height = elem.css('lineHeight').replace(/[^-\d\.]/g, '');
		}
		
		// Take into account margin-top and border
		var add_to = 0;
		if( elem.outerHeight(true) > elem.height() ) {
			add_to = elem.outerHeight(true) - elem.height();
		}
		
		if( line_height > 0 ) {
			return (line_height * options.line_count) + add_to;
		} else {
			return false;
		}
		
	};
	
	Plugin.prototype.guidGenerator = function() {
		var S4 = function() {
		   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	};

    // You don't need to change something below:
    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations and allowing any
    // public function (ie. a function whose name doesn't start
    // with an underscore) to be called via the jQuery plugin,
    // e.g. $(element).lava_read_more_truncate('functionName', arg1, arg2)
    $.fn[pluginName] = function ( options ) {
        var args = arguments;

        // Is the first parameter an object (options), or was omitted,
        // instantiate a new instance of the plugin.
        if (options === undefined || typeof options === 'object') {
            return this.each(function () {

                // Only allow the plugin to be instantiated once,
                // so we check that the element has no plugin instantiation yet
                if (!$.data(this, 'plugin_' + pluginName)) {
					if( $(this).attr('id') ) {
						options.this_id = $(this).attr('id');
					} else {
						var new_id = 'lava_read_more_truncate_' + Plugin.prototype.guidGenerator();
						$(this).attr('id', new_id);
						options.this_id = new_id;
					}
                    // if it has no instance, create a new one,
                    // pass options to our plugin constructor,
                    // and store the plugin instance
                    // in the elements jQuery data object.
                    $.data(this, 'plugin_' + pluginName, new Plugin( this, options ));
                }
            });

        // If the first parameter is a string and it doesn't start
        // with an underscore or "contains" the `init`-function,
        // treat this as a call to a public method.
        } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {

            // Cache the method call
            // to make it possible
            // to return a value
            var returns;

            this.each(function () {
                var instance = $.data(this, 'plugin_' + pluginName);

                // Tests that there's already a plugin-instance
                // and checks that the requested public method exists
                if (instance instanceof Plugin && typeof instance[options] === 'function') {

                    // Call the method of our plugin instance,
                    // and pass it the supplied arguments.
                    returns = instance[options].apply( instance, Array.prototype.slice.call( args, 1 ) );
                }

                // Allow instances to be destroyed via the 'destroy' method
                if (options === 'destroy') {
                  $.data(this, 'plugin_' + pluginName, null);
                }
            });

            // If the earlier cached method
            // gives a value back return the value,
            // otherwise return this to preserve chainability.
            return returns !== undefined ? returns : this;
        }
    };

}(jQuery, window, document));