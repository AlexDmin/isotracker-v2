import React, { Component } from 'react';
import UploadReportPopUp from "../../components/uploadReportPopUp/uploadReportPopUp"
import UploadEquisModelledPopUp from "../../components/uploadEquisModelledPopUp/uploadEquisModelledPopUp"
import UploadEquisEstimatedPopUp from "../../components/uploadEquisEstimatedPopUp/uploadEquisEstimatedPopUp"
import UploadInstrumentationModelledPopUp from '../uploadInstrumentationModelledPopUp/uploadInstrumentationModelledPopUp';
import UploadInstrumentationEstimatedPopUp from '../uploadInstrumentationEstimatedPopUp/uploadInstrumentationEstimatedPopUp';
import UploadCivilEstimatedPopUp from '../uploadCivilEstimtedPopUp/uploadCivilEstimtedPopUp';
import UploadCivilModelledPopUp from '../uploadCivilModelledPopUp/uploadCivilModelledPopUp';
import UploadElectricalEstimatedPopUp from '../uploadElectricalEstimatedPopUp/uploadElectricalEstimatedPopUp';
import UploadElectricalModelledPopUp from '../uploadElectricalModelledPopUp/uploadElectricalModelledPopUp';
import UploadPipesEstimatedPopUp from '../uploadPipesEstimatedPopUp/uploadPipesEstimatedPopUp';

export default class ReportBoxBtns extends Component {

    setErrorReport(){
        this.props.setErrorReport();
    }

    setUploading(active){
        this.props.setUploading(active)
    }

    setErrorReportData(index){
        this.props.setErrorReportData(index)
    }


    render() {
        let adminBtns = null
        if(this.props.user === "super@user.com"){
            adminBtns = <div><button className="btn btn-bg btn-info" style={{float:"left", marginTop:"10px", marginLeft:"10px", height:"150px", width:"150px"}} onClick={() => this.props.downloadStatus3D()}>Status 3D</button>
            <UploadReportPopUp setUploading={this.setUploading.bind(this)} setErrorReport={this.setErrorReport.bind(this)}/>
            <UploadPipesEstimatedPopUp setUploading={this.setUploading.bind(this)} setErrorReport={this.setErrorReport.bind(this)} setErrorReportData={this.setErrorReportData.bind(this)}/>
            <UploadEquisModelledPopUp setUploading={this.setUploading.bind(this)} setErrorReport={this.setErrorReport.bind(this)} setErrorReportData={this.setErrorReportData.bind(this)}/>
            <UploadEquisEstimatedPopUp setUploading={this.setUploading.bind(this)} setErrorReport={this.setErrorReport.bind(this)} setErrorReportData={this.setErrorReportData.bind(this)}/>
            <UploadInstrumentationModelledPopUp setUploading={this.setUploading.bind(this)} setErrorReport={this.setErrorReport.bind(this)} setErrorReportData={this.setErrorReportData.bind(this)}/>
            <UploadInstrumentationEstimatedPopUp setUploading={this.setUploading.bind(this)} setErrorReport={this.setErrorReport.bind(this)} setErrorReportData={this.setErrorReportData.bind(this)}/>
            <UploadCivilModelledPopUp setUploading={this.setUploading.bind(this)} setErrorReport={this.setErrorReport.bind(this)} setErrorReportData={this.setErrorReportData.bind(this)}/>
            <UploadCivilEstimatedPopUp setUploading={this.setUploading.bind(this)} setErrorReport={this.setErrorReport.bind(this)} setErrorReportData={this.setErrorReportData.bind(this)}/>
            <UploadElectricalModelledPopUp setUploading={this.setUploading.bind(this)} setErrorReport={this.setErrorReport.bind(this)} setErrorReportData={this.setErrorReportData.bind(this)}/>
            <UploadElectricalEstimatedPopUp setUploading={this.setUploading.bind(this)} setErrorReport={this.setErrorReport.bind(this)} setErrorReportData={this.setErrorReportData.bind(this)}/>
            </div>

        }
        return (
            <div className="reports__container">
                <button className="btn btn-bg btn-success" style={{float:"left", marginTop:"10px", marginLeft:"10px", height:"150px", width:"150px"}} onClick={() => this.props.downloadHistory()}>Comments</button>
                <button className="btn btn-bg btn-success" style={{float:"left", marginTop:"10px", marginLeft:"10px", height:"150px", width:"150px"}} onClick={() => this.props.downloadStatus()}>Status</button>
                <button className="btn btn-bg btn-success" style={{float:"left", marginTop:"10px", marginLeft:"10px", height:"150px", width:"150px"}} onClick={() => this.props.downloadPI()}>SPO-SIT</button>
                <button className="btn btn-bg btn-success" style={{float:"left", marginTop:"10px", marginLeft:"10px", height:"150px", width:"150px"}} onClick={() => this.props.downloadIssued()}>Issued</button>
                <button className="btn btn-bg btn-success" style={{float:"left", marginTop:"10px", marginLeft:"10px", height:"150px", width:"150px"}} onClick={() => this.props.downloadModelled()}>Modelled</button>
                {adminBtns}
                
            </div>
        );
    }
}