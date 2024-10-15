# dapp

Best practice for the react server component and web3 dapp development:
- use the 'use client' directive for the client only component.
  In this case, server will also try to render the document, but server won't execute the code, then there will be the hydration process when ready on client side.
- use dynamic import for the case sometimes content will inevitably differ between the server and client.
  Case like `const { address } = useAcccount()`, the address will be undefined on server side and a value on the client when the wallect has been connected with the injected connector.
  Dynamic import will just put a placeholder element on the server side and do a replacement on the client side when ready.

Highlights:
- auto lint, auto fix, auto sort imports, tailwindcss classes of the code, for a same development standard across the project contributors
- use svg symbols to avoid bulk assets requests
- form validation with Zod
- refetch balance after transaction made, by sharing states between components with Zustand
- support transfer erc20 token
- support eip1559 gas estimation and send transaction with suggested buffer
- big number handling with bignumber.js
- transaction history page suspense with react server component and support refresh new data when switch network
- api fetch/post with next server actions, no api router
- infrastructure as code use terraform, CI/CD with github actions on aws ECS fargate

Todo:
- multicall support from Contract side
- support MTK faucet
- better form management with react-hook-form
- responsive ui adaption
- implement retry mechanism when transaction success but post api fails, consider basic retry logic or use message queue like Kafka with aws Lambda
- implement post api background mechanism to avoid user close page or switch page which will lost that transaction history record, consider a prevent diaglog, or register a pub/sub mechanism to subscribe to a BlockNumber along with the txHash


Questions:
- scroll gas estimation contains layer 1 fee and layer 2 fee?

Notes:
- found an issue of wagmi: https://github.com/wevm/wagmi/issues/4332
- resolved a complex case that wagmi ssr cookie need to be work on server side and the config of rainbowkit should be only run in client side. thus will lead a build error if mixed, detailed here: https://github.com/rainbow-me/rainbowkit/issues/2215

Deprecated:
- use cookie storage as initial state to avoid a flash of "empty" data before hydration
- basic / advanced wallet toggle to connect with built in logic or the rainbowkit modal

### Development

Run on localhost:

```bash
pnpm i
pnpm dev
```

Git workflow(Chunk based development):  
Develop on the develop or feat_<your_feature_name> branch, once the feature is complete, submit a Pull Request from develop to main.

CI/CD:  
Merge PR from master to dev/staging/production will build and deploy the relevant environment
