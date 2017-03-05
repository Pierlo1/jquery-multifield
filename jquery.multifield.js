/**
 * jQuery Multifield plugin
 *
 * https://github.com/maxkostinevich/jquery-multifield
 */


// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, document, undefined ) {

	/*
	 * Plugin Options
	 * section (string) -  selector of the section which is located inside of the parent wrapper
	 * max (int) - Maximum sections
	 * btnAdd (string) - selector of the "Add section" button - can be located everywhere on the page
	 * btnRemove (string) - selector of the "Remove section" button - should be located INSIDE of the "section"
	 * locale (string) - language to use, default is english
	 */

	// our plugin constructor
	var multiField = function( elem, options ){
		this.elem = elem;
		this.$elem = $(elem);
		this.options = options;
		// Localization
		this.localize_i18n={
        "multiField": {
          "messages": {
            "removeConfirmation": "Are you sure you want to remove this section?"
          }
        }
      };

		// This next line takes advantage of HTML5 data attributes
		// to support customization of the plugin on a per-element
		// basis. For example,
		// <div class=item' data-mfield-options='{"section":".group"}'></div>
		this.metadata = this.$elem.data( 'mfield-options' );
	};

	// the plugin prototype
	multiField.prototype = {

		defaults: {
			max: 0,
			locale: 'default'
		},
		

		init: function() {
			var $this = this; //Plugin object
			// Introduce defaults that can be extended either
			// globally or using an object literal.
			this.config = $.extend({}, this.defaults, this.options,
				this.metadata);

			// Load localization object
      if(this.config.locale !== 'default'){
  			$this.localize_i18n = this.config.locale;
      }

			// Hide 'Remove' buttons if only one section exists
			if(this.getSectionsCount()<2) {
				$(this.config.btnRemove, this.$elem).hide();
			}

			// Add section
			this.$elem.on('click',this.config.btnAdd,function(e){
				e.preventDefault();
				$this.cloneSection();
			});

			// Remove section
			this.$elem.on('click',this.config.btnRemove,function(e){
				e.preventDefault();
				var currentSection=$(e.target.closest($this.config.section));
				$this.removeSection(currentSection);
			});

			return this;
		},


		/*
		 * Add new section
		 */
		cloneSection : function() {
			// Allow to add only allowed max count of sections
			if((this.config.max!==0)&&(this.getSectionsCount()+1)>this.config.max){
				return false;
			}

			// Clone last section
			var newChild = $(this.config.section, this.$elem).last().clone().attr('style', '').attr('id', '').fadeIn('fast');

			// Clear input values
			$('input[type=text],input[type=date],input[type=hidden],textarea', newChild).each(function () {
				$(this).val('');
			});

			// Initialize DateTime Pickers
            $('input[data-plugin=datetimepicker]', newChild).each(function() {
                $(this).datetimepicker( eval('[' + $(this).attr('data-options') + ']')[0] );
            })

			// Duplicate and clear select2 inputs
            $('select[data-plugin=select2]', newChild).each(function() {
                var options = [];

                $(this).find('option').each(function() {
                    options.push({ id: this.value, text: this.value });
                });

                var width = $(this).next().css('width');

                $(this).select2({ data: options });

                $(this).siblings('.select2').last().remove();

                $(this).next().css('width', width);
			});

            // Update name[i] to [i+1] on indicated inputs
            this.incrementInput(newChild, 'input.increment,textarea.increment,select.increment');

			// Fix radio buttons: update name [i] to [i+1]
            this.incrementInput(newChild, 'input[type="radio"]');

			// Reset radio button selection
			$('input[type=radio]',newChild).attr('checked', false);

			// Clear images src with reset-image-src class
			$('img.reset-image-src', newChild).each(function () {
				$(this).attr('src', '');
			});

			// Append new section
            this.$elem.children(this.config.section).last().after(newChild);
			// this.$elem.append(newChild);

			// Show 'remove' button
			$(this.config.btnRemove, this.$elem).show();
		},

		/*
		 * Remove existing section
		 */
		removeSection : function(section){
			if (confirm(this.localize_i18n.multiField.messages.removeConfirmation)){
				var sectionsCount = this.getSectionsCount();

				if(sectionsCount<=2){
					$(this.config.btnRemove,this.$elem).hide();
				}
				section.slideUp('fast', function () {$(this).detach();});
			}
		},

        /**
         * Increment number in input name by 1
         */
        incrementInput: function(child, input){
            child.find(input).each(function(){
                var name=$(this).attr('name');
                $(this).attr('name',name.replace(/([0-9]+)/g,1*(name.match(/([0-9]+)/g))+1));
            });
        },

		/*
		 * Get sections count
		 */
		getSectionsCount: function(){
			return this.$elem.children(this.config.section).length;
		}

	};

	multiField.defaults = multiField.prototype.defaults;

	$.fn.multifield = function(options) {
		return this.each(function() {
			new multiField(this, options).init();
		});
	};



})( jQuery, window, document );