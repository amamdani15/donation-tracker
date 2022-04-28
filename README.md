# donation-tracker

This was built specifically for use with givingfuel, their donation tracker updates about every 15 minutes, but for an institution that may be doing a live donation campaign, this updates about 10 seconds after a donation is recieved. There is support for external donations as well, and the api can easily be queried for a thermometer to be displayed on a livestream or a on-site display. 

On givingfuel you will direct the webhook from your campaign to {siteurl}/{institution}_donation_webhook and it will consume the webhook and update the total amount raised. 

Each campaign will generate its own total automatically.

for setup, you will need to add the institution into a variable at the top, add in all the institutions into the list of institutions and create a post api with the institution name in the url. There are example api blocks to copy. 

This api can be hosted on any domain, any endpoints are based off the base URL. Feel free to reach out with any questions.  



endpoints:
		
		/get_campaign_total

		This allows you to see the total amount collected for a specific campaign.

		required queryParams:
			institution - name of institution, must be lowercase.
			campaign - the name of the webhook set in givingfuel.

		setting campaign as "all" shows all campaigns.




	/add_external_donation

		This allows you to add in a donation that may have been received as cash/check or method other than givingfuel. 

		required queryParams:
			institution - name of institution, must be lowercase.
			campaign - the name of the webhook set in givingfuel.
			amount - the amount received, as an integer. 


	/set_campaign_amount

		This allows you to set a number that you want a campaign to have. This is useful in the case that a mistake is made while adding a donation manually, or for any other reason.


		required queryParams:
			institution - name of institution, must be lowercase.
			campaign - the name of the webhook set in givingfuel.
			amount - the amount received, as an integer. 


	/{institution}_donation_webhook

		This is the endpoint that you will direct the institutions webhook to. This will consume the webhook from givingfuel and add it to the total for your campaign. 

		required queryParams:
			None