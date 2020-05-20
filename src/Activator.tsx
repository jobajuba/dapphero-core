import React, { useContext, useEffect, useState } from 'react'

import * as consts from 'consts'
import * as contexts from 'contexts'
import { loggerTest } from 'logger/loggerTest'

import { EVENT_NAMES } from 'providers/EmitterProvider/constants'
import { EmitterContext } from 'providers/EmitterProvider/context'
import { FeatureReducer } from './protocol/ethereum/featureReducer'

import { highlightDomElements } from './utils/highlightDomElements'

import { openSeaApi as nftApi } from './protocol/ethereum/nft/api'
import { pinata } from './api/pinata'

// Log tests and Startup Logs
loggerTest()

// TODO: Type configuration
type ActivatorProps = {
  configuration: any;
  domElements: any;
  setConfig: any;
  supportedNetworks: any;
  retriggerEngine: () => void;
}

export const Activator = ({ configuration, retriggerEngine, domElements, setConfig, supportedNetworks }: ActivatorProps) => {

  // Ethereum
  const ethereum = useContext(contexts.EthereumContext)

  // This needs to filter for Unique Contracts
  const contractElements = domElements.filter((element) => element.feature === 'customContract')

  const getDomContractElements = () => {
    const filteredForContracts = domElements.filter((element) => element.feature !== 'customContract')
    return contractElements.length ? [ ...filteredForContracts, { id: contractElements[0].id, feature: 'customContract' } ] : filteredForContracts
  }

  const domElementsFilteredForContracts = getDomContractElements()

  // TODO: [DEV-248] We should make this an app level state later.
  const AppReady = true

  const { actions: { listenToEvent } } = useContext(EmitterContext)

  // Allow users to add contracts using Javascript
  const addClientSideContract = ({ contractName, contractAddress, contractAbi, networkId }) => {
    const existingContracts = configuration.contracts
    setConfig({ contracts: [ ...existingContracts, { contractName, contractAddress, contractAbi, networkId } ] })
  }

  const [ thisPinata, setPinata ] = useState(pinata)
  useEffect(() => {
    thisPinata.testAuthentication().then((result) => {
      // handle successful authentication here
      console.log(result)
    }).catch((err) => {
      // handle error here
      console.log(err)
    })
  }, [])

  useEffect(() => {
    const dappHero = {
      debug: false,
      enabled: true,
      highlightEnabled: false,
      domElements,
      configuration,
      collectibles: { nftApi },
      contracts: {},
      addClientSideContract,
      retriggerEngine,
      projectId: consts.global.apiKey,
      provider: ethereum,
      pinataIPFS: thisPinata,
      toggleHighlight(): void {
        dappHero.highlightEnabled = !dappHero.highlightEnabled
        highlightDomElements(dappHero.highlightEnabled, domElements)
      },
      listenToContractOutputChange: (cb): void => listenToEvent(EVENT_NAMES.contract.outputUpdated, cb),
      listenToContractAutoInvokeChange: (cb): void => listenToEvent(EVENT_NAMES.contract.autoInvoke, cb),
      listenToTransactionStatusChange: (cb): void => listenToEvent(EVENT_NAMES.contract.statusChange, cb),
      listenToContractInvokeTriggerChange: (cb): void => listenToEvent(EVENT_NAMES.contract.invokeTrigger, cb),
      listenToSmartContractBlockchainEvent: (cb): void => listenToEvent(EVENT_NAMES.contract.contractEvent, cb),
    }
    Object.assign(window, { dappHero })

    // Dispatch the event.
    const event = new CustomEvent('dappHeroConfigLoaded', { detail: dappHero })
    document.dispatchEvent(event)
  }, [ AppReady ])

  if (!AppReady || !domElementsFilteredForContracts) return null
  return (
    <>
      {domElementsFilteredForContracts
          && domElementsFilteredForContracts.map((domElement) => (
            <FeatureReducer
              key={domElement.id}
              element={domElement.element}
              feature={domElement.feature}
              configuration={configuration}
              info={domElement}
              customContractElements={contractElements}
            />
          ))}
    </>
  )

}
