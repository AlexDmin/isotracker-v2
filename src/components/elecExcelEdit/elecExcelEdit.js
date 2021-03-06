import React from 'react';
import 'antd/dist/antd.css';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';


class ElecExcelEdit extends React.Component{
  state = {
    searchText: '',
    searchedColumn: '',
    data: [],
    tab: this.props.currentTab,
    selectedRows: [],
    selectedRowsKeys: [],
    updateData: this.props.updateData,
    username: "",
    acronyms : null,
    steps: [],
    areas: [],
    types: [],
  };

  async componentDidMount(){

    const options = {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },
    }

    fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/electrical/estimated", options)
    .then(response => response.json())
    .then(json => {
      var rows = []
      var row = null
      rows.push({"Area": "Area", "Type": "Type", "Quantity": "Quantity"})
      for(let i = 0; i < json.rows.length; i++){

          row = {"Area": json.rows[i].area, "Type": json.rows[i].type, "Quantity": json.rows[i].quantity}

          rows.push(row)
      }
      this.setState({data : rows, selectedRows: []});

  }) 

  fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/api/areas", options)
    .then(response => response.json())
    .then(json => {
      let areas_options = []
      for(let i = 0; i < json.length; i++){
        areas_options.push(json[i].name)
      }
      this.setState({areas : areas_options});

  })

  fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/electrical/types", options)
    .then(response => response.json())
    .then(json => {
      let types_options = []
      for(let i = 0; i < json.rows.length; i++){
        types_options.push(json.rows[i].name)
      }
      this.setState({types : types_options});

  })
}

  addRow(){
    let rows = this.state.data
    rows.push({"Area": "", "Type": "", "Quantity": ""})
    this.setState({data: rows})
  }
  
  submitChanges(){
    const body = {
      rows: this.state.data,
    }
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    }
    fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/submit/electrical/estimated", options)
    .then(response => response.json())
    .then(json =>{

    })
  }

  render() {

    const settings = {
        licenseKey: 'non-commercial-and-evaluation',
        colWidths: 400,
        //... other options
      }
  

      return (
          <div style={{marginLeft:"12%"}}>
            <div id="hot-app">
              <HotTable
                data={this.state.data}
                colHeaders={true}
                rowHeaders={true}
                width="1276"
                height="650"
                settings={settings} 
                manualColumnResize={true}
                manualRowResize={true}
                columns= {[{ data: "Area", type:'dropdown', source: this.state.areas }, { data: "Type", type:'dropdown', source: this.state.types }, {data: "Quantity", type:"numeric"}]}
              />
              <br></br>
              <div style={{marginLeft:"580px"}}>
                  <button class="btn btn-sm btn-info" onClick={() => this.addRow()} style={{marginRight:"5px", fontSize:"16px", width:"60px"}}>Add</button>
                  <button class="btn btn-sm btn-success" onClick={() => this.submitChanges()} style={{marginRight:"5px", fontSize:"16px", width:"60px"}}>Save</button>
              </div>
            </div>
          </div>
      );
  }
}

export default ElecExcelEdit;