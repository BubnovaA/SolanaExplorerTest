function TransactionDetail(props) {

    return (
        <tr>
            <td><p><small>{props.signature}</small></p></td>
            <td><p><small>{props.err}</small></p></td>
            <td><p><small>{props.blockTime}</small></p></td>
            <td><p><small>{props.blockHash}</small></p></td>
            <td><p><small>[{props.balanceChange}]</small></p></td>
        </tr>
    )
}



class App extends React.Component {

    state = {
        solanaTransactions: [],
        }
    allTransactions = [];
    count = 0;
    pageCount = 10;


    /* Fetch parsed transaction details for a batch of confirmed transactions */
    /*  required  <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.js"></script>/*
    getDetailsTransactions(solanaTransactions, start) {

        solanaTransactions.slice(start, start + this.pageCount)
            .map(value => {
                console.log(value);
                value.blockTime = moment(value.blockTime * 1000).format("DD-MM-YYYY HH:mm:ss");
                (value.err === null || value.err === "success") ? value.err = "success" : value.err = "failed";
                let transactionDetail = connectionsol.getParsedConfirmedTransaction(value.signature);
                transactionDetail.then(
                    result => {
                        value.blockHash = result.transaction.message.recentBlockhash;
                        value.balanceChange = this.calcBalance(result.meta.postBalances, result.meta.preBalances);
                        this.setState({ solanaTransactions });
                    },
                    error => console.log(error.message)
                );

            })
        this.setState({ solanaTransactions });
    }

    /* Pagination */
    loadTransaction() {
        
        (this.count <= this.allTransactions.length) ? this.viewPage(this.count) : false;
        
    }
    viewPage(start) {

        let solanaTransactions = this.allTransactions.slice(start, start + this.pageCount);
        (this.state.solanaTransactions != []) ? (solanaTransactions = this.state.solanaTransactions.concat(solanaTransactions)) : false;
        this.setState({ solanaTransactions });
        this.getDetailsTransactions(solanaTransactions, start);
        this.count = start + this.pageCount;
    }

    /* Calculating the balance, element-wise, between two arrays postBalance and preBalance */
    calcBalance(postBalance, preBalance) {

        try {
            return postBalance
                .map((value, index) => value - preBalance[index])
                .filter(value => value != 0)
                .map(value => value / Math.pow(10, 9))
                .join("; ");
        }
        catch (err) {
            console.log(err)
        }
    }

    /* Returns confirmed signatures for transactions involving an address backwards in time from the provided signature or most recent confirmed block*/
    searchTransaction(pk) {
        
        let publicKey = new solanaWeb3.PublicKey(pk);
        let confirmedSignatures = connectionsol.getConfirmedSignaturesForAddress2(publicKey);
        this.state.solanaTransactions = [];
        this.count = 0;
        this.setState({ solanaTransactions: this.state.solanaTransactions });

        confirmedSignatures.then(
            result => {
                this.allTransactions = result.slice();
                this.viewPage(0);
            },
            error => console.log(error.message)
        );
    }

    /* Render */
    renderTransaction() {
        return (this.state.solanaTransactions.map(solanaTransact => {
            return (
                <TransactionDetail
                    signature={solanaTransact.signature}
                    err={solanaTransact.err}
                    blockTime={solanaTransact.blockTime}
                    blockHash={solanaTransact.blockHash}
                    balanceChange={solanaTransact.balanceChange}
                    key={solanaTransact.signature}

                />
            )
        } ) 
        )
    }
    render() {

        return (
            <div className="app">
                <div className="container">
                    <h4>Solana explorer</h4>
                    <hr />

                    <form className="row">
                        <div className="col-12">
                            <input type="text" className="form-control" placeholder="Адрес аккаунта" id="account" onChange={(event) => this.searchTransaction(event.target.value)} />
                        </div>

                    </form>
                    <hr />
                    <table className="table table-sm">
                        <thead className="thead-dark">
                            <tr>
                                <th>Signature</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>BlockHash</th>
                                <th>BalanceChange</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.renderTransaction()}
                        </tbody>
                    </table>
                    <button className="form-control btn btn-light" onClick={(event) => this.loadTransaction()} >Load more</button>
                </div>
            </div>
        )
    }
}


let connectionsol = new solanaWeb3.Connection('http://vip-api.mainnet-beta.solana.com/')
ReactDOM.render(<App />, document.getElementById('root'))




