<p align="center">
  <a href="https://app.juster.fi/"><img src="https://i.imgur.com/KVgm2G0.png" alt="Logo"></a>

  <h3 align="center">Juster Finance</h3>
  <p align="center">
    Decentralized Betting Protocol
    <br />
    <br />
    <a href="https://app.juster.fi/">Application</a>
    ·
    <a href="https://discord.gg/FeGDCkHhnB">Discord</a>
    ·
    <a href="https://app.juster.fi/docs">Documentation (WIP)</a>
  </p>
</p>

<br />

<p align="center">
    <h3 align="center">Juster Libraries:</h3>
    <p align="center">
        <a href="https://github.com/juster-finance/juster-core">Core</a>
        ·
        <a href="https://github.com/juster-finance/juster-sdk">SDK</a>
        ·
        <a href="https://github.com/juster-finance/juster-dipdup">DipDup</a>
    </p>
</p>


<br />

<p align="center">
    <img src="https://img.shields.io/badge/Release-1.0%3A%20Mainnet%20Lanuch-red"/>
    <a href="https://github.com/juster-finance/juster-app/stargazers"><img src="https://img.shields.io/github/stars/juster-finance/juster-app" alt="Github Stars"></a>
    <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
    <a href="https://github.com/juster-finance/juster-app/issues"><img src="https://img.shields.io/github/issues-raw/juster-finance/juster-app"/></a>
    <a href="https://github.com/juster-finance/juster-app/pulse"><img src="https://img.shields.io/github/commit-activity/m/juster-finance/juster-app" alt="Commits-per-month"></a>
</p>

<br/>

<img src="https://i.imgur.com/xhWvft1.png">

<br/>

# Decentralized Betting Protocol

[Juster](https://app.juster.fi) is an on-chain smart contract platform
allowing users to take part in an automated betting market by
creating events, providing liquidity to them, and making bets. 

Our main goal is to provide the most transparent betting system for everyone. At the initial stage, we will give you the opportunity to bet on price changes of different currency pairs (ETH-USD, BTC-USD & XTZ-USD).

# Glossary

### Event
Juster’s contract data structure, consisting of a bunch of parameters and associated with some off-chain event through an on-chain oracle’s data feed. Each Juster’s Event has two possible outcomes S and ̅S that is determined using the oracle data.

### Bet
An on-chain operation that represents a bet of a certain amount of tez on one of an Event’s outcomes.

### Liquidity Providing
An on-chain operation that represents adding of a certain amount of tokens to the Event as a liquidity.

### Submissions (Total Value Locked)
Liquidity + Bets. Submissions consist of provided liquidity and bets. Most often used for aggregated statistics.

### Close Time
The moment of time when the final data can be retrived from the oracle to define the Event outcome and the Event can be closed.

### Measure Period
The time interval from the end of accepting bets period to the event 

### Reward
The amount that will be available for withdrawal after the Event is closed in case of correctly guessing the Event outcome

<br/>
<br/>

---
# Developers

### Setup

1. Clone this repo
```sh
   git clone https://github.com/juster-finance/juster-app
```

2. Open project folder
```sh
    cd juster-app
```

3. Install dependencies
```sh
    yarn
```

4. Run in development mode
```sh
    yarn serve
```

<br/>

### Project Structure
[Work in Progress]

<br/>


### Built With

- [Vue (v3)](https://vuejs.org/)
- [Apollo](https://www.apollographql.com/)
- [D3](https://d3js.org/)
- [Pinia](https://pinia.vuejs.org/)

# Provenance 

### Contract Address 
- `KT1D6XTy8oAHkUWdzuQrzySECCDMnANEchQq`<sub>
    [[tzkt]](https://tzkt.io/KT1D6XTy8oAHkUWdzuQrzySECCDMnANEchQq) /
    [[arronax]](https://arronax.io/tezos/mainnet/accounts/query/eyJmaWVsZHMiOlsiYmxvY2tfbGV2ZWwiLCJhY2NvdW50X2lkIiwiYmFsYW5jZSIsImRlbGVnYXRlX3ZhbHVlIiwic3RvcmFnZSIsImNvdW50ZXIiXSwicHJlZGljYXRlcyI6W3siZmllbGQiOiJhY2NvdW50X2lkIiwib3BlcmF0aW9uIjoiZXEiLCJzZXQiOlsiS1QxRDZYVHk4b0FIa1VXZHp1UXJ6eVNFQ0NETW5BTkVjaFFxIl0sImludmVyc2UiOmZhbHNlfV0sIm9yZGVyQnkiOlt7ImZpZWxkIjoiYmxvY2tfbGV2ZWwiLCJkaXJlY3Rpb24iOiJkZXNjIn1dLCJhZ2dyZWdhdGlvbiI6W10sImxpbWl0Ijo1MDAwfQ) /
    [[bcd]](https://better-call.dev/mainnet/KT1D6XTy8oAHkUWdzuQrzySECCDMnANEchQq) /
    [[tzstats]](https://tzstats.com/KT1D6XTy8oAHkUWdzuQrzySECCDMnANEchQq)</sub>

### Origination 

- Creator: `tz1Lbp9byNSXY8rKYJ4RXmW8iPXYVBvYNCoF`<sub>
      [[tzkt]](https://tzkt.io/tz1Lbp9byNSXY8rKYJ4RXmW8iPXYVBvYNCoF) /
      [[arronax]](https://arronax.io/tezos/mainnet/accounts/query/eyJmaWVsZHMiOlsiYmxvY2tfbGV2ZWwiLCJhY2NvdW50X2lkIiwiYmFsYW5jZSIsImRlbGVnYXRlX3ZhbHVlIiwic3RvcmFnZSIsImNvdW50ZXIiXSwicHJlZGljYXRlcyI6W3siZmllbGQiOiJhY2NvdW50X2lkIiwib3BlcmF0aW9uIjoiZXEiLCJzZXQiOlsidHoxTGJwOWJ5TlNYWThyS1lKNFJYbVc4aVBYWVZCdllOQ29GIl0sImludmVyc2UiOmZhbHNlfV0sIm9yZGVyQnkiOlt7ImZpZWxkIjoiYmxvY2tfbGV2ZWwiLCJkaXJlY3Rpb24iOiJkZXNjIn1dLCJhZ2dyZWdhdGlvbiI6W10sImxpbWl0Ijo1MDAwfQ) /
      [[tzstats]](https://tzstats.com/tz1Lbp9byNSXY8rKYJ4RXmW8iPXYVBvYNCoF)</sub>
- Date: `JAN-26-2022`
- Time: `05h:27m:10s`
- Block `2063541`<sub>
      [[tzkt]](https://tzkt.io/2063541) /
      [[arronax]](https://arronax.io/tezos/mainnet/operations/query/eyJmaWVsZHMiOlsibGV2ZWwiLCJibG9ja19sZXZlbCIsIm9wZXJhdGlvbl9ncm91cF9oYXNoIl0sInByZWRpY2F0ZXMiOlt7ImZpZWxkIjoibGV2ZWwiLCJvcGVyYXRpb24iOiJlcSIsInNldCI6WyIyMDYzNTQxIl0sImludmVyc2UiOmZhbHNlfV0sIm9yZGVyQnkiOlt7ImZpZWxkIjoibGV2ZWwiLCJkaXJlY3Rpb24iOiJkZXNjIn1dLCJhZ2dyZWdhdGlvbiI6W10sImxpbWl0Ijo1MDAwfQ) /
      [[bcd]](https://better-call.dev/mainnet/opg/opaHDrmD5Ni4xJVtSYsQgoh3zsFZj879SPUSguNTpyySYy2QZQd/) /
      [[tzstats]](https://tzstats.com/2063541)</sub>
      
- Hash: `opaHDrmD5Ni4xJVtSYsQgoh3zsFZj879SPUSguNTpyySYy2QZQd`<sub>
      [[tzkt]](https://tzkt.io/opaHDrmD5Ni4xJVtSYsQgoh3zsFZj879SPUSguNTpyySYy2QZQd) /
      [[arronax]](https://arronax.io/tezos/mainnet/operations/query/eyJmaWVsZHMiOlsiYmxvY2tfbGV2ZWwiLCJvcGVyYXRpb25fZ3JvdXBfaGFzaCIsImNvdW50ZXIiLCJjeWNsZSIsImZlZSJdLCJwcmVkaWNhdGVzIjpbeyJmaWVsZCI6Im9wZXJhdGlvbl9ncm91cF9oYXNoIiwib3BlcmF0aW9uIjoiZXEiLCJzZXQiOlsib3BhSERybUQ1Tmk0eEpWdFNZc1Fnb2gzenNGWmo4NzlTUFVTZ3VOVHB5eVNZeTJRWlFkIl0sImludmVyc2UiOmZhbHNlfV0sIm9yZGVyQnkiOlt7ImZpZWxkIjoiYmxvY2tfbGV2ZWwiLCJkaXJlY3Rpb24iOiJkZXNjIn1dLCJhZ2dyZWdhdGlvbiI6W10sImxpbWl0Ijo1MDAwfQ) /
      [[tzstats]](tzstats.com/opaHDrmD5Ni4xJVtSYsQgoh3zsFZj879SPUSguNTpyySYy2QZQd) /
