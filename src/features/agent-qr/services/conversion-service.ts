function buildSoapRequest(date: Date) {
  const formattedDate = date.toISOString().split("T")[0] + "T00:00:00";

  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://bus.colvir.com/service/conversion/v1">
   <soapenv:Header/>
   <soapenv:Body>
      <v1:calculateConversionAmountElem>
         <v1:date>${formattedDate}</v1:date>
         <v1:rateSource>E_RATE</v1:rateSource>
         <v1:rateType>RAT_FIZ</v1:rateType>
        <v1:amountList>
            <v1:amount>1</v1:amount>
            <v1:currencyFrom>EUR</v1:currencyFrom>
            <v1:currencyTo>TJS</v1:currencyTo>
            <v1:type>from</v1:type>
         </v1:amountList>
         <v1:amountList>
           <v1:amount>1</v1:amount>
            <v1:currencyFrom>TJS</v1:currencyFrom>
            <v1:currencyTo>EUR</v1:currencyTo>
            <v1:type>to</v1:type>
        </v1:amountList>
        <v1:amountList>
           <v1:amount>1</v1:amount>
            <v1:currencyFrom>USD</v1:currencyFrom>
            <v1:currencyTo>TJS</v1:currencyTo>
            <v1:type>from</v1:type>
        </v1:amountList>
        <v1:amountList>
           <v1:amount>1</v1:amount>
            <v1:currencyFrom>TJS</v1:currencyFrom>
            <v1:currencyTo>USD</v1:currencyTo>
            <v1:type>to</v1:type>
        </v1:amountList>
        <v1:amountList>
           <v1:amount>1000</v1:amount>
            <v1:currencyFrom>RUB</v1:currencyFrom>
            <v1:currencyTo>TJS</v1:currencyTo>
            <v1:type>from</v1:type>
        </v1:amountList>
        <v1:amountList>
           <v1:amount>1000</v1:amount>
            <v1:currencyFrom>TJS</v1:currencyFrom>
            <v1:currencyTo>RUB</v1:currencyTo>
            <v1:type>to</v1:type>
        </v1:amountList>
      </v1:calculateConversionAmountElem>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function parseSoapResponse(xmlText: string) {
  if (typeof window === 'undefined') return [];
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  const amountLists = xmlDoc.getElementsByTagNameNS(
    "http://bus.colvir.com/service/conversion/v1",
    "amountList",
  );

  const rates = [];

  for (let i = 0; i < amountLists.length; i++) {
    const node = amountLists[i];

    const getText = (tagName: string) => {
      const el = node.getElementsByTagNameNS(
        "http://bus.colvir.com/service/conversion/v1",
        tagName,
      );
      return el.length > 0 ? el[0].textContent : "";
    };

    rates.push({
      amount: parseFloat(getText("amount") || "0"),
      currencyFrom: getText("currencyFrom"),
      amountTo: parseFloat(getText("amountTo") || "0"),
      currencyTo: getText("currencyTo"),
      type: getText("type"),
    });
  }

  return rates;
}

export const conversionService = {
  async fetchConversionRates(date = new Date()) {
    const soapBody = buildSoapRequest(date);

    const response = await fetch("/api/conversion", {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "",
      },
      body: soapBody,
    });

    if (!response.ok) {
      throw new Error(`Ошибка запроса курсов: ${response.status}`);
    }

    const xmlText = await response.text();
    return parseSoapResponse(xmlText);
  }
};
