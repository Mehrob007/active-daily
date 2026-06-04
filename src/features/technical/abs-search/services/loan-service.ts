const LOANS_NS = "http://bus.colvir.com/service/loans/v1";

const generateUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const formatSoapDateTime = (date = new Date()) => {
  return date.toISOString().split(".")[0];
};

const formatSoapDate = (date = new Date()) => {
  return date.toISOString().split("T")[0];
};

function buildLoanDetailsSoapRequest(referenceId: string) {
  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://bus.colvir.com/service/loans/v1" xmlns:v11="http://bus.colvir.com/common/support/v1" xmlns:v12="http://bus.colvir.com/common/basis/v1" xmlns:v13="http://bus.colvir.com/common/domain/v1">
   <soapenv:Header/>
   <soapenv:Body>
      <v1:loadLoanDetailsRequest>
         <v12:colvirReferenceId>${referenceId}</v12:colvirReferenceId>
         <v1:detail>
            <v1:analyticalAccounts>1</v1:analyticalAccounts>
            <v1:analyticalAccMovements>1</v1:analyticalAccMovements>
            <v1:balanceAccounts>1</v1:balanceAccounts>
            <v1:sumTypes>1</v1:sumTypes>
            <v1:paymentOptions>1</v1:paymentOptions>
            <v1:consolidationGroups>1</v1:consolidationGroups>
            <v1:deaParams>1</v1:deaParams>
            <v1:coBorrowers>1</v1:coBorrowers>
         </v1:detail>
      </v1:loadLoanDetailsRequest>
   </soapenv:Body>
</soapenv:Envelope>`;
}

function parseLoanDetailsSoapResponse(xmlText: string) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  const getElementValue = (parent: Element | null, tagName: string) => {
    if (!parent) return "";
    const elements = parent.getElementsByTagName("*");
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].localName === tagName) return elements[i].textContent;
    }
    return "";
  };

  const findElement = (parent: Element | null, tagName: string) => {
    if (!parent) return null;
    const elements = parent.getElementsByTagName("*");
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].localName === tagName) return elements[i];
    }
    return null;
  };

  const responseElem = xmlDoc.getElementsByTagNameNS("*", "loadLoanDetailsResponse")[0];
  if (!responseElem) return null;

  const loanElem = findElement(responseElem, "loan");
  if (!loanElem) return null;

  const agreementDataElem = findElement(loanElem, "agreementData");

  const params = {
    referenceId: getElementValue(agreementDataElem, "colvirReferenceId"),
    contractNumber: getElementValue(agreementDataElem, "code"),
    statusName: getElementValue(findElement(agreementDataElem, "status"), "name"),
    productName: getElementValue(findElement(agreementDataElem, "product"), "name"),
    creditPurpose: getElementValue(findElement(agreementDataElem, "purpose"), "name"),
    amount: getElementValue(agreementDataElem, "amount"),
    currency: getElementValue(agreementDataElem, "currency"),
    documentDate: getElementValue(agreementDataElem, "documentDate"),
    term: getElementValue(agreementDataElem, "termTU"),
    startDate: getElementValue(agreementDataElem, "dateFrom"),
    endDate: getElementValue(agreementDataElem, "dateTo"),
    department: getElementValue(findElement(agreementDataElem, "department"), "name"),
    clientDea: getElementValue(findElement(agreementDataElem, "deaClient"), "name"),
  };

  const balanceAccountsRoot = findElement(loanElem, "balanceAccounts");
  const balanceNodes = balanceAccountsRoot ? balanceAccountsRoot.getElementsByTagName("*") : [];
  const balances: any[] = [];

  const sumTypesRoot = findElement(loanElem, "sumTypes");
  const sumTypeNodes = sumTypesRoot ? sumTypesRoot.getElementsByTagName("*") : [];
  let percentRate = "0";
  let penaltyRate = "0";
  for (let i = 0; i < sumTypeNodes.length; i++) {
    const node = sumTypeNodes[i];
    if (node.localName === "sumType") {
      const dmName = getElementValue(node, "name");
      if (dmName === "Проценты по кредиту") {
        percentRate = getElementValue(node, "pcn");
      }
      if (dmName === "Штраф за просрочку основного долга") { 
        penaltyRate = getElementValue(node, "pcn");
      }
    }
  }

  for (let i = 0; i < balanceNodes.length; i++) {
    const node = balanceNodes[i];
    if (node.localName === "balanceAccount") {
      const balance = getElementValue(node, "balance");
      const curr = getElementValue(node, "currCode");
      balances.push({
        code: getElementValue(node, "nps"),
        name: getElementValue(node, "accCode"),
        amount: `${balance} ${curr}`,
        nps: getElementValue(node, "nps"),
        accCode: getElementValue(node, "accCode"),
        balance: balance,
        currCode: curr,
        activeFl: getElementValue(node, "activeFl"),
        colvirReferenceId: getElementValue(node, "colvirReferenceId"),
      });
    }
  }

  const paymentOptionsRoot = findElement(loanElem, "paymentOptions");
  const paymentOptionNodes = paymentOptionsRoot ? paymentOptionsRoot.getElementsByTagName("*") : [];
  const paymentOptions: any[] = [];

  for (let i = 0; i < paymentOptionNodes.length; i++) {
    const node = paymentOptionNodes[i];
    if (node.localName === "paymentOption") {
      paymentOptions.push({
        code: getElementValue(node, "code"),
        name: getElementValue(node, "name"),
        accCode: getElementValue(node, "accCode"),
        colvirReferenceId: getElementValue(node, "colvirReferenceId"),
      });
    }
  }

  return { ...params, balances, percentRate, penaltyRate, paymentOptions };
}

function buildRepayLoanSoapRequest({ referenceId, amount, sourceOrdNum }: any) {
  const requestId = generateUUID();
  const operationalDate = formatSoapDateTime();
  const petitionDate = formatSoapDate();

  return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://bus.colvir.com/service/loans/v1" xmlns:v11="http://bus.colvir.com/common/support/v1" xmlns:v12="http://bus.colvir.com/common/basis/v1" xmlns:v13="http://bus.colvir.com/common/domain/v1">
   <soapenv:Header/>
   <soapenv:Body>
      <v1:repayLoanEarlyRequest>
         <v11:head>
            <v11:requestId>${requestId}</v11:requestId>
            <v11:sessionId>1</v11:sessionId>
            <v11:processId>1</v11:processId>
            <v11:params>
               <v11:clientType>CBS</v11:clientType>
               <v11:interfaceVersion>1.0</v11:interfaceVersion>
               <v11:language>ru</v11:language>
               <v11:operationalDate>${operationalDate}</v11:operationalDate>
            </v11:params>
         </v11:head>
         <v12:colvirReferenceId>${referenceId}</v12:colvirReferenceId>
         <v1:amount>${amount}</v1:amount>
         <v1:repayment>ODONLY</v1:repayment>
         <v1:source>A</v1:source>
         <v1:sourceOrdNum>${sourceOrdNum}</v1:sourceOrdNum>
         <v1:petitionDate>${petitionDate}</v1:petitionDate> 
         <v1:petitionNumber>1</v1:petitionNumber>
      </v1:repayLoanEarlyRequest>
   </soapenv:Body>
</soapenv:Envelope>`;
}

export const loanSoapService = {
  async getLoanDetails(referenceId: string) {
    try {
      const soapRequest = buildLoanDetailsSoapRequest(referenceId);
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: "",
        },
        body: soapRequest,
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const xmlText = await response.text();
      return parseLoanDetailsSoapResponse(xmlText);
    } catch (error) {
      console.error("Error fetching loan details via SOAP:", error);
      throw error;
    }
  },

  async repayLoan(repayData: any) {
    try {
      const soapRequest = buildRepayLoanSoapRequest(repayData);
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: "",
        },
        body: soapRequest,
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return true;
    } catch (error) {
      console.error("Error in repayLoanSoap:", error);
      throw error;
    }
  }
};
