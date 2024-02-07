# TOHA Calculator

This calculator allows users to estimate the value of future TOHA network tokens they could swap their MAHI for based on the date and value of their investment. 

[![TOHA Calculator](https://github.com/toha-network/time-value-of-action/blob/main/Images/calculator.gif)](https://github.com/toha-network/time-value-of-action/blob/main/Images/calculator.gif)
     

## About this calculator

The Toha Network operates a payments system for verifiable environmental impact, based on a dual token system. 

- **MAHI units** are used to fund and account for environmental action and can be swapped for TOHA.
- **TOHA** are tradeable network tokens that enable high-trust, low-cost sharing of data about environmental impacts among Network members and give holders governance rights.

This calculator allows users to estimate the value of future TOHA network tokens they could swap their MAHI for based on the date and value of their investment. The earlier users invest, the higher their **Time Value of Action multiplier** and the more TOHA they can recieve.



## Time Value of Action multiplier

The Time Value of Action (TVA) is a core financial principle in the Toha Network that states that action today is worth more now than action in the future. It takes inspiration from Time Value of Money logic. 

Note the calculations below are **only the indicative TVA calculation**. It will be confirmed in the upcoming Toha Network white paper. Register [here](https://toha.network/contact-us) get notified when it is published.

The TVA calculation, and any changes made to it over time, will always be transparently recorded in this public repository.  


#### Calculations


The TVA discount at midday on 14 February 2024 will be 50 percent. The TVA discount (in percent) for Time Credits earned after midday on 14 February 2024 will be:

[![Screenshot-2024-02-07-at-1-11-01-PM.png](https://github.com/toha-network/time-value-of-action/blob/main/Images/tva.png)](https://github.com/toha-network/time-value-of-action/blob/main/Images/tva.png)


Toha also wants to recognise contributions made before the 14th of February. Where Toha grants Time Credits for actions before midday on 14 February 2024, the discount is 50% with an adjustment for inflation:

[![Screenshot-2024-02-07-at-1-12-53-PM.png](https://github.com/toha-network/time-value-of-action/blob/main/Images/inflation.png)](https://github.com/toha-network/time-value-of-action/blob/main/Images/inflation.png)




   
## More about the Toha Network

Check out the links below to: 
- [Learn about the Toha Network](https://mahi.toha.network/about)
- [See how the system works](https://mahi.toha.network/#howitworks) 
- [Check out common FAQS about the system](https://toha.network/faq)
- [Register to get notified when the TOHA white paper is published](https://toha.network/contact-us)




## Calculator Installation

#### Include the JS and stylsheet in your head or body section:
```
<script type="text/javascript" src="toha-calculator.js"></script>
<link rel="stylesheet" href="toha-calculator.css">
```
You can replace `toha-calculator.css` with `toha-calculator-unstyled.css` if you prefer to use a minimal stylesheet and apply your own styling.
#### Create an element in your HTML to attach the calculator to:
```
<div id="calc"></div>
```

#### Create a new instance of the calculator in JS:
``` 
var tc = new TohaCalculator('calc': elementId, true: enableChart);
```

 elementId: Id of the element to attach the calculator to.

 enableChart: boolean to show or hide the ChartJS chart.

If you intend to enable the chart, be sure include both ChartJS and the annotations plugin scripts. Eg:
```
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/chartjs-plugin-annotation/3.0.1/chartjs-plugin-annotation.min.js" ></script>
```

