import React from "react";
import { EthereumContextProvider } from "./context/ethereum";
import reducer from "./modules/reducer";
import { Request } from "./modules/types";

const App: React.FC = () => {
  const dappHeroTopLevelModule = "dh"; //MOCK THIS FOR NOW BUT LATER SHOULD COME FROM DATABASE
  const elements: any[] = Array.prototype.slice.call(
    document.querySelectorAll(`[id^=${dappHeroTopLevelModule}]`)
  );

  console.log("Elements: ", elements);

  return (
    <EthereumContextProvider>
        {elements.map(element => {
          console.log("element:", element);
          const domElementId = element.id;
          const requestString = domElementId.split("-");
          const index = 1;
          const request: Request = {
            requestString,
            element,
            arg: requestString[index],
            index
          };
          return reducer(request);
        })}
    </EthereumContextProvider>
  );
};

export default App;
