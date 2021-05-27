import DataTable from "../../components/datatable/datatable"
import ReportBtns from "../../components/reportBtns/reportBtns"
import StateTable from "../../components/stateTable/stateTable"
import NavBtns from "../../components/navBtns/navBtns"
import DragAndDrop from "../../components/dragAndDrop/dragAndDrop"
import "./isoCtrl.css"
import React, { useState , useEffect} from 'react'
import ActionButtons from "../../components/actionBtns/actionBtns"
import SelectPag from "../../components/selectPag/selectPag"
import CheckInTable from "../../components/checkInTable/checkInTable"
import NavBar from '../../components/navBar/navBar'
import MyTrayBtn from "../../components/myTrayBtn/myTrayBtn"
import MyTrayTable from "../../components/myTrayTable/myTrayTable"
import BinBtn from '../../components/binBtn/binBtn'
import BinTable from "../../components/binTable/binTable"
import OnHoldTable from "../../components/onHoldTable/onHoldTable"
import StatusDataTable from "../../components/statusDataTable/statusDataTable"
import HistoryDataTable from "../../components/historyDataTable/historyDataTable"
import RoleDropDown from "../../components/roleDropDown/roleDropDown"

import Alert from '@material-ui/lab/Alert';
import Collapse from '@material-ui/core/Collapse'
import OnHoldBtn from "../../components/onHoldBtn/onHoldBtn"
import ProcInsBtn from "../../components/procInsBtn/procInsBtn"
import ReportsBtn from "../../components/reportsBtn/reportsBtn"
import ProcInstTable from "../../components/procInstTable/procInstTable"
import JSZip from 'jszip'
import { saveAs } from 'file-saver';
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import ReportBoxBtns from "../../components/reportBoxBtns/reportBoxBtns"
import IssuedBtn from "../../components/issuedBtn/issuedBtn"


const IsoCtrl = () => {
   
    document.body.style.zoom = 0.9
    const[pagination, setPagination] = useState(8) //Controla el numero de entradas por pagina de la tabla
    const [currentRole, setCurrentRole] = useState();
    const [roles, setRoles] = useState();
    const [selected, setSelected] = useState([]);
    const [updateData, setUpdateData] = useState();
    const [comment, setComment] = useState(" ");
    const [commentAlert, setCommentAlert] = useState(false);
    const [downloadZip, setDownloadzip] = useState(new JSZip());
    const [loading, setLoading] = useState(false);
    const [errorUnclaim, setErrorUnclaim] = useState(false);
    const [errorPI, setErrorPI] = useState(false);
    const [errorCL, setErrorCL] = useState(false);
    const [transactionSuccess, setTransactionSuccess] = useState(false);
    const [errorReports, setErrorReports] = useState(false);
    const [progress, setProgress] = useState(0);
    const [realProgress, setRealProgress] = useState(0);
    const [progressISO, setProgressISO] = useState(0);
    const [realProgressISO, setRealProgressISO] = useState(0);
    const [errorUnclaimR, setErrorUnclaimR] = useState(false);

    const CryptoJS = require("crypto-js");
    const SecureStorage = require("secure-web-storage");
    var SECRET_KEY = 'sanud2ha8shd72h';
    
    var secureStorage = new SecureStorage(localStorage, {
        hash: function hash(key) {
            key = CryptoJS.SHA256(key, SECRET_KEY);
    
            return key.toString();
        },
        encrypt: function encrypt(data) {
            data = CryptoJS.AES.encrypt(data, SECRET_KEY);
    
            data = data.toString();
    
            return data;
        },
        decrypt: function decrypt(data) {
            data = CryptoJS.AES.decrypt(data, SECRET_KEY);
    
            data = data.toString(CryptoJS.enc.Utf8);
    
            return data;
        }
    });

    const [currentTab, setCurrentTab] = useState(secureStorage.getItem("tab")) //Controla la tabla y botones que se muestran
    //La altura de la tabla es fija en funcion de la paginacion para evitar que los botones se muevan
    var dataTableHeight = 8

    if (pagination === 8){
        dataTableHeight = "550px"
    }if(pagination === 25){
        dataTableHeight = "1250px"
    }if(pagination === 50){
        dataTableHeight = "2250px"
    }if(pagination === 100){
        dataTableHeight = "4330px"
    }

    //Componentes de la pagina que varian en funcion del estado
    var uploadButton, actionButtons, actionText, commentBox, tableContent, procInsBtn, issuedBtn
    var currentTabText = currentTab
    if(currentTabText === "LDE/IsoControl"){
        currentTabText = "LOS/IsoControl"
    }
    tableContent = <DataTable forceUnclaim = {forceUnclaim.bind(this)} onChange={value=> setSelected(value)} selected = {selected} pagination = {pagination} currentTab = {currentTab} currentRole={currentRole} updateData = {updateData}/>
    var pageSelector = <SelectPag onChange={value => setPagination(value)} pagination = {pagination}/>
    var currentUser = secureStorage.getItem('user')

    
    
    useEffect(()=>{
        const body = {
            user: currentUser,
        }
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }
        fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/api/roles/user", options)
            .then(response => response.json())
            .then(json => {
                setRoles(json.roles);
                if(secureStorage.getItem('role') !== null){
                    setCurrentRole(secureStorage.getItem('role'))
                }else{
                    secureStorage.setItem('role', json.roles[0])
                    setCurrentRole(secureStorage.getItem('role'))
                }
                }
            )
            .catch(error => {
                console.log(error);
            })       
            setErrorPI(false)
            setErrorUnclaimR(false)
            setErrorCL(false)
            setUpdateData(!updateData)
            setTransactionSuccess(false);
            setErrorUnclaim(false)
            setErrorReports(false)
            setLoading(false)
    },[currentRole]);

    useEffect(()=>{
        setErrorUnclaimR(false)
        setErrorPI(false);
        setErrorCL(false)
        setTransactionSuccess(false)
        setErrorUnclaim(false)
        setLoading(false)
        setErrorReports(false)
        setSelected([])
    }, [currentTab])

    const getProgress = () =>{
        setUpdateData(!updateData)

    }

    const claim = async(event) => {
        setErrorUnclaimR(false)
        setErrorReports(false)
        setErrorCL(false)
        setErrorUnclaim(false)
        setTransactionSuccess(false);
        setErrorPI(false)
        console.log(selected)
        if(selected.length > 0){
            setLoading(true)
            localStorage.setItem("update", true)
            if(currentTab === "Process"){
                for (let i = 0; i < selected.length; i++){
                
                    const body ={
                        user : currentUser,
                        file: selected[i],
                        role: currentRole
                    }
                    const options = {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(body)
                    }
                    await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/claimProc", options)
                }
            }else if(currentTab === "Instrument"){
                for (let i = 0; i < selected.length; i++){
                
                    const body ={
                        user : currentUser,
                        file: selected[i],
                        role: currentRole
                    }
                    const options = {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(body)
                    }
                    await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/claimInst", options)
                }
            }else{
                for (let i = 0; i < selected.length; i++){
                
                    const body ={
                        user : currentUser,
                        file: selected[i],
                        role: currentRole
                    }
                    const options = {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(body)
                    }
                    await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/claim", options)
                }
            
            }
            setUpdateData(!updateData)
            setLoading(false)
            setSelected([])
            
        }
     
    }   
    
    const forceClaim = async(username) =>{
        setErrorUnclaimR(false)
        setErrorReports(false)
        setErrorCL(false)
        setErrorUnclaim(false)
        setTransactionSuccess(false);
        setErrorPI(false)
        if(selected.length > 0){
            setLoading(true)
            localStorage.setItem("update", true)
            for (let i = 0; i < selected.length; i++){
                
                const body ={
                    user : username,
                    file: selected[i],
                    los: currentUser
                }
                console.log(body)
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
                await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/forceClaim", options)
            }
            setUpdateData(!updateData)
            setLoading(false)
            setSelected([])
        }
    }

    const unclaim = async (event) =>{
        setErrorUnclaimR(false)
        setErrorReports(false)
        setErrorUnclaim(false)
        setErrorCL(false)
        setTransactionSuccess(false);
        setErrorPI(false)
        if(selected.length > 0){
            setLoading(true)
            localStorage.setItem("update", true)
            if (currentRole === "Process"){
                for (let i = 0; i < selected.length; i++){
                    const body ={
                        user : currentUser,
                        file: selected[i],
                        role: currentRole
                    }
                    const options = {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(body)
                    }
                    await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/unclaimProc", options)
                }
            }else if(currentRole === "Instrument"){
                for (let i = 0; i < selected.length; i++){
                    const body ={
                        user : currentUser,
                        file: selected[i],
                        role: currentRole
                    }
                    const options = {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(body)
                    }
                    console.log(body)
                    await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/unclaimInst", options)
                }
            }else{
                for (let i = 0; i < selected.length; i++){
                    const body ={
                        user : currentUser,
                        file: selected[i],
                        role: currentRole
                    }
                    const options = {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(body)
                    }
                    await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/unclaim", options)
                    .then(response => response.json())
                    .then(json=>{
                        if(json.error === "forced"){
                            setErrorUnclaim(true)
                        }else if(json.error === "returned"){
                            setErrorUnclaimR(true)
                        }
                    })
                    .catch(err => {
                    });
                }
            }
            await setUpdateData(!updateData)
            setLoading(false)
            setSelected([])
        }
        
    }

    async function forceUnclaim(fileName){
        setErrorUnclaimR(false)
        setErrorReports(false)
        setErrorCL(false)
        setErrorUnclaim(false)
        setTransactionSuccess(false);
        setErrorPI(false)
        setLoading(true)
        localStorage.setItem("update", true)
        const body ={
            user : currentUser,
            file: fileName,
            role: currentRole
        }
        console.log(body)
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }
        console.log(body)
        await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/forceUnclaim", options)
        await setUpdateData(!updateData)
        setLoading(false)
        setSelected([])
    }


    const verifyClick = async(event) =>{
        setErrorUnclaimR(false)
        setErrorReports(false)
        setErrorCL(false)
        setErrorUnclaim(false)
        setTransactionSuccess(false);
        setErrorPI(false)
        setLoading(true)
        console.log("Envio a verify")
        if(selected.length > 0){
            localStorage.setItem("update", true)
            for (let i = 0; i < selected.length; i++){
                
                const body ={
                    user : currentUser,
                    file: selected[i],
                    role: currentRole
                }
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
                await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/verify", options)
            }
            await setUpdateData(!updateData)
            setLoading(false)
            setSelected([])
        }    
    }

    async function cancelVerifyClick(filename){
        setErrorUnclaimR(false)
        setErrorReports(false)
        setErrorUnclaim(false)
        setTransactionSuccess(false);
        setLoading(true)
        localStorage.setItem("update", true)
            
            const body ={
                user : currentUser,
                file: filename,
                role: currentRole
            }
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
            await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/cancelVerify", options)
        
        await setUpdateData(!updateData)
        setLoading(false)
        setSelected([])
    }

    async function transaction(destiny){
        
        if(selected.length > 0){
            setErrorUnclaimR(false)
            setErrorReports(false)
            setErrorCL(false)
            setErrorUnclaim(false)
            setErrorPI(false);
            setTransactionSuccess(false);
            setLoading(true)
            if(destiny === "Design"){
                if(comment.length > 1){
                    setComment(" ")
                    setCommentAlert(false)
                    localStorage.setItem("update", true)
                    for (let i = 0; i < selected.length; i++){
                        const body ={
                            user : currentUser,
                            fileName: selected[i],
                            to: destiny,
                            role: secureStorage.getItem("role"),
                            comment: comment,
                            deleted: 0,
                            onhold: 0
                        }
                        const options = {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(body)
                        }
                        await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/api/transaction", options)
                        setTransactionSuccess(true)
                    }
                }else{
                    console.log("vacio")
                    setCommentAlert(true)
                }
            }else if (destiny === "LDE/Isocontrol"){
                for (let i = 0; i < selected.length; i++){
                    const options = {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        },
                    }
                    await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/piStatus/"+selected[i], options)
                    .then(response => response.json())
                    .then(async json =>{
                        if(json.sit === 1 || json.sit === 4 || json.spo === 1 || json.spo === 4){
                            localStorage.setItem("update", true)
                            setErrorPI(true);
                            setTransactionSuccess(false);
                        }else{
                            setCommentAlert(false)
                            localStorage.setItem("update", true)
                            let deleted, hold = 0
                    
                            const body ={
                                user : currentUser,
                                fileName: selected[i],
                                to: destiny,
                                role: secureStorage.getItem("role"),
                                comment: null,
                                deleted: deleted,
                                onhold: hold
                            }
                            const options = {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(body)
                            }
                            await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/api/transaction", options)
                            .then(response => response.json())
                            .then(async json=>{
                                console.log(json)
                                if(json.error){
                                    await setErrorCL(true) 
                                }
                            })
                            if(!errorCL){
                                setTransactionSuccess(true)
                            }
                            
                        }
                    })
                }
                await setUpdateData(!updateData)
                setLoading(false)
            }else{
                setCommentAlert(false)
                localStorage.setItem("update", true)
                let deleted, hold = 0

                if(destiny === "Recycle bin"){
                    deleted = 1
                }

                if(destiny === "On hold"){
                    hold = 1
                }
                for (let i = 0; i < selected.length; i++){
                    
                    const body ={
                        user : currentUser,
                        fileName: selected[i],
                        to: destiny,
                        role: secureStorage.getItem("role"),
                        comment: null,
                        deleted: deleted,
                        onhold: hold
                    }
                    const options = {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(body)
                    }
                    await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/api/transaction", options)
                    setTransactionSuccess(true)
                }
            }
            await setUpdateData(!updateData)
            setLoading(false)
            await getProgress()
            setSelected([])
        }    
    }

    async function returnLead(destiny){
        setErrorReports(false)
        setErrorUnclaim(false)
        setErrorCL(false)
        setTransactionSuccess(false);
        setErrorPI(false)
        setErrorUnclaimR(false)
        setLoading(true)
        localStorage.setItem("update", true)
        for (let i = 0; i < selected.length; i++){
                    
            const body ={
                user : currentUser,
                fileName: selected[i],
                to: destiny,
                from: currentTab
            }
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
            await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/api/returnLead", options)
            setTransactionSuccess(true)
        }
        await setUpdateData(!updateData)
        setLoading(false)
        await getProgress()
        setSelected([])
    }
    
    async function returnLeadStress(){
        setErrorReports(false)
        setErrorUnclaim(false)
        setErrorCL(false)
        setTransactionSuccess(false);
        setErrorPI(false)
        setErrorUnclaimR(false)
        setLoading(true)

        if(selected.length > 0){
            localStorage.setItem("update", true)
            for (let i = 0; i < selected.length; i++){
                        
                const body ={
                    user : currentUser,
                    file: selected[i],
                    comments: comment
                }
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
                await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/api/returnLeadStress", options)
                setTransactionSuccess(true)
            }
            await setUpdateData(!updateData)
            setLoading(false)
            await getProgress()
            setSelected([])
        }
    }

    function handleComment(event){
        setComment(event.target.value)
    }

    async function restore(){
        setErrorReports(false)
        setErrorUnclaimR(false)
        setErrorUnclaim(false)
        setErrorCL(false)
        setTransactionSuccess(false);
        setErrorPI(false)
        console.log(selected.length)
        if(selected.length > 0){
            setLoading(true)
            localStorage.setItem("update", true)
            for (let i = 0; i < selected.length; i++){
                const body ={
                    fileName: selected[i],
                    user: currentUser,
                    role: currentRole,
                    deleted: 0,
                    onhold: 0
                }
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
                await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/restore", options)
                setTransactionSuccess(true)
            }
            await setUpdateData(!updateData)
            console.log("restored")
            setLoading(false)
            await getProgress()
            setSelected([])
        }
    }

    function procOrInst(tab) {
        if(tab === "Process" || tab === "Instrument"){
            setCurrentTab(tab)
        }else if (currentRole === "Process"){
            setCurrentTab("Process")
        }else{
            setCurrentTab("Instrument")
        }
    }

    async function sendProcessClick(fileName){
        setErrorUnclaimR(false)
        setErrorReports(false)
        setErrorUnclaim(false)
        setErrorCL(false)
        setTransactionSuccess(false);
        setLoading(true)
        localStorage.setItem("update", true)
            
            const body ={
                user : currentUser,
                file: fileName,
                role: currentRole
            }
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
            await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/process", options)
        
        await setUpdateData(!updateData)
        setLoading(false)
        setSelected([])
    }

    async function sendInstrumentClick(fileName){
        setErrorReports(false)
        setErrorUnclaim(false)
        setErrorUnclaimR(false)
        setTransactionSuccess(false);
        setErrorCL(false)
        setLoading(true)
        localStorage.setItem("update", true)
            
            const body ={
                user : currentUser,
                file: fileName,
                role: currentRole
            }
            const options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            }
            await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/instrument", options)
        
        await setUpdateData(!updateData)
        setLoading(false)
        setSelected([])
    }

    async function sendCancelProcessClick(fileName){
        setErrorReports(false)
        setErrorUnclaim(false)
        setErrorUnclaimR(false)
        setTransactionSuccess(false);
        setErrorCL(false)
        setLoading(true)
        localStorage.setItem("update", true)

        const body ={
            file: fileName
        }
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }
        await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/cancelProc", options)
    
        await setUpdateData(!updateData)
        await setLoading(false)
        setSelected([])
    }

    async function sendCancelInstrumentClick(fileName){
        setErrorReports(false)
        setErrorUnclaim(false)
        setErrorUnclaimR(false)
        setTransactionSuccess(false);
        setErrorCL(false)
        setLoading(true)
        localStorage.setItem("update", true)
        const body ={
            file: fileName
        }
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        }
        await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/cancelInst", options)
    
        await setUpdateData(!updateData)
        setLoading(false)
        setSelected([])
    }

    function updateD(){
        setUpdateData(!updateData)
    }

    async function downloadFiles(){
        setErrorUnclaimR(false)
        setErrorReports(false)
        setErrorCL(false)
        setTransactionSuccess(false);
        setErrorUnclaim(false)
        setLoading(true)
        localStorage.setItem("update", true)
        /*
        if(selected.length === 1){
            localStorage.setItem("update", true)
            for (let i = 0; i < selected.length; i++){
                const options = {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/pdf"
                    }
                }
                await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/download/"+selected[i], options)
                .then(res => res.blob())
                    .then(response =>{
                        console.log("Se descarga")
                        download(new Blob([response]), selected[i], "application/pdf")
                    })
            }
        }else if (selected.length > 1){
            localStorage.setItem("update", true)
            for (let i = 0; i < selected.length; i++){

                const options = {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/pdf"
                    }
                }
                await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/download/"+selected[i], options)
                .then(res => res.blob())
                    .then(response =>{
                        setDownloadzip(downloadZip.file(selected[i], new Blob([response]),{binary:true}))   
                    })
            }
            const zipname = String(Date().toLocaleString().replace(/\s/g, '-').split('-G').slice(0, -1))
            downloadZip.generateAsync({type:"blob"}).then(function (blob) { // 1) generate the zip file
                saveAs(blob,  zipname)
            })
            
        }
        await setUpdateData(!updateData)
        await setDownloadzip(new JSZip())   
        setLoading(false)
        */
        for (let i = 0; i < selected.length; i++){

            const options = {
                method: "GET",
                headers: {
                    "Content-Type": "application/pdf"
                }
            }
            
            await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/getAttach/"+selected[i], options)
            .then(response => response.json())
            .then(async json => {
                await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/download/"+selected[i], options)
                .then(res => res.blob())
                .then( async response =>{
                    setDownloadzip(downloadZip.file(selected[i], new Blob([response]),{binary:true}))   
                    for(let i = 0; i < json.length; i++){
                        await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/download/"+json[i], options)
                        .then(res => res.blob())
                        .then(response =>{
                            setDownloadzip(downloadZip.file(json[i], new Blob([response]),{binary:true}))   
                        })
                    }
                     
                })
            })
        

            
    
        }
        const zipname = String(Date().toLocaleString().replace(/\s/g, '-').split('-G').slice(0, -1))
        downloadZip.generateAsync({type:"blob"}).then(function (blob) { // 1) generate the zip file
            saveAs(blob,  zipname)
        })  
        
        await setDownloadzip(new JSZip())   
        //await setAttachFiles(null)
        await setUpdateData(!updateData)
        setLoading(false)
        setSelected([])
        
    }

    async function downloadHistory(){
        setErrorReports(false)

        await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/downloadHistory/")
        .then(response => response.json())
        .then(json => {
            const headers = ["ISO_ID", "FROM", "TO", "DATE", "COMMENT", "USER"]
            exportToExcel(JSON.parse(json), "Comments", headers)
        })
    }

    async function downloadStatus(){
        setErrorReports(false)

        await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/downloadStatus/")
        .then(response => response.json())
        .then(json => {
            const headers = ["ISO_ID", "START_DATE", "CURRENT_DATE", "CONDITION"]
            exportToExcel(JSON.parse(json), "Status", headers)
        })
    }

    async function downloadPI(){
        setErrorReports(false)

        await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/downloadPI/")
        .then(response => response.json())
        .then(json => {
            const headers = ["ISO_ID", "PROCESS", "INSTRUMENTATION", "UPDATED_AT"]
            exportToExcel(JSON.parse(json), "IsoStatusSIT-SPO", headers)
        })
    }

    async function downloadIssued(){
        setErrorReports(false)

        await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/downloadIssued/")
        .then(response => response.json())
        .then(json => {
            const headers = ["ISO_ID", "REV0", "REV1", "REV2", "REV3", "REV4"]
            exportToExcel(JSON.parse(json), "IsoStatusIssued", headers)
        })
    }

    async function downloadStatus3D(){
        setErrorReports(false)

        await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/downloadStatus3D/")
        .then(response => response.json())
        .then(json => {
            let output = JSON.stringify(json.log)
            output = output.substring(1,output.length-1)
            output = output.replaceAll(",", "\n")
            output = output.replaceAll(/['"]+/g, "")


            const data = new Blob([output], { type: 'txt' });
            FileSaver.saveAs(data, "statusprogresspipe.pmlmac");
        })
    }

    const exportToExcel = (apiData, fileName, headers) => {
        setErrorReports(false)
        const fileType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const header_cells = ['A1', 'B1', 'C1', 'D1', 'E1', 'F1', 'G1', 'H1', 'I1', 'J1', 'K1', 'L1', 'M1', 'O1']
        const fileExtension = ".xlsx";

        let wscols = []
        for(let i = 0; i < headers.length; i++){
            wscols.push({width:35})
        }

        const ws = XLSX.utils.json_to_sheet(apiData);   
        ws["!cols"] = wscols
        for(let i = 0; i < headers.length; i++){
            ws[header_cells[i]].v = headers[i]
        }
        const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);

    }

    async function setUploading(active){
        setErrorReports(false)
        setLoading(active)
        if(!active){
            setTransactionSuccess(true)
        }
    }

    async function setErrorReport(){
        setErrorReports(true)
    }

    async function issue(transmittal, date){
        setErrorUnclaimR(false)
        setErrorReports(false)
        setTransactionSuccess(false);
        setErrorCL(false)
        setErrorUnclaim(false)
        setLoading(true)

        console.log(transmittal)
        
        if (selected.length > 0){
            localStorage.setItem("update", true)
            for (let i = 0; i < selected.length; i++){
                const body ={
                    user : currentUser,
                    file: selected[i],
                    role: currentRole,
                    transmittal: transmittal,
                    date: date
                }
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
                await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/toIssue", options)
            }
            await setUpdateData(!updateData)
            setLoading(false)
            await getProgress()
            setSelected([])
        }
    }

    async function newRev() {
        setErrorReports(false)
        setErrorUnclaimR(false)
        setTransactionSuccess(false);
        setErrorCL(false)
        setErrorUnclaim(false)
        setLoading(true)
        if (selected.length > 0){
            localStorage.setItem("update", true)
            for (let i = 0; i < selected.length; i++){
                const body ={
                    user : currentUser,
                    file: selected[i],
                    role: currentRole,
                }
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
                await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/newRev", options)
            }
            setUpdateData(!updateData)
            setLoading(false)
            await getProgress()
            setSelected([])
        }
    }

    async function request() {
        setErrorUnclaimR(false)
        setErrorReports(false)
        setTransactionSuccess(false);
        setErrorCL(false)
        setErrorUnclaim(false)
        setLoading(true)
        if (selected.length > 0){
            localStorage.setItem("update", true)
            for (let i = 0; i < selected.length; i++){
                const body ={
                    user : currentUser,
                    file: selected[i],
                    role: currentRole,
                }
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
                await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/request", options)
                
            }
            setUpdateData(!updateData)
            setLoading(false)
            setSelected([])
        }

    }

    async function returnIso(destiny, comments){
        setErrorUnclaimR(false)
        setErrorReports(false)
        setTransactionSuccess(false);
        setErrorCL(false)
        setErrorUnclaim(false)
        setLoading(true)
        if (selected.length > 0){
            localStorage.setItem("update", true)
            if(comments.length < 1){
                comments = comment
            }
            for (let i = 0; i < selected.length; i++){
                const body ={
                    user : currentUser,
                    file: selected[i],
                    role: currentRole,
                    from: currentTab,
                    destiny: destiny,
                    comments: comments
                }
                const options = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
                await fetch("http://"+process.env.REACT_APP_SERVER+":"+process.env.REACT_APP_NODE_PORT+"/returnIso", options)
                
            }
            setUpdateData(!updateData)
            setLoading(false)
            setComment("")
            setSelected([])
        }
    }

    if(currentTab === "Upload IsoFiles"){
        secureStorage.setItem("tab", "Upload IsoFiles")
        uploadButton = <button  type="button" class="btn btn-info btn-lg" style={{backgroundColor: "#17a2b8", width:"180px"}}><b>Upload</b></button>
        tableContent = <DragAndDrop mode={"upload"} role={currentRole} user={currentUser}  uploaded={getProgress.bind(this)}/>
        pageSelector = null
    }if(currentTab === "Design" && currentRole === "Design"){
        uploadButton = <button  type="button" className="btn btn-info btn-lg" style={{backgroundColor: "lightblue", width:"180px"}} onClick={() => setCurrentTab("Upload IsoFiles")}><b>Upload</b></button>
    }if(currentTab === "CheckBy"){
        tableContent = <CheckInTable/>
    }if(currentTab === "My Tray"){
        tableContent = <MyTrayTable  updateData = {updateData} onChange={value=> setSelected(value)} cancelVerifyClick={cancelVerifyClick.bind(this)} sendProcessClick={sendProcessClick.bind(this)} sendInstrumentClick = {sendInstrumentClick.bind(this)} sendCancelProcessClick={sendCancelProcessClick.bind(this)} sendCancelInstrumentClick={sendCancelInstrumentClick.bind(this)} updateD = {updateD.bind(this)} pagination = {pagination} currentRole = {currentRole} currentUser = {currentUser} selected={selected} />
    }if(currentTab === "Recycle bin"){
        tableContent = <BinTable onChange={value=> setSelected(value)} selected = {selected} pagination = {pagination} currentTab = {currentTab} updateData = {updateData}/>
    }if(currentTab === "On hold"){
        tableContent = <OnHoldTable onChange={value=> setSelected(value)} selected = {selected} pagination = {pagination} currentTab = {currentTab} updateData = {updateData}/>
    }if(currentTab === "Status"){
        tableContent = <StatusDataTable pagination = {pagination} role = {currentRole}/>
    }if(currentTab === "History"){
        tableContent = <HistoryDataTable pagination = {pagination}/>   
    }if(currentRole === "Process" || currentRole === "Instrument" || currentRole === "SpecialityLead"){
        procInsBtn = <ProcInsBtn onChange={value => procOrInst(value)} currentTab = {currentTab} />
    }if(currentTab === "Process" || currentTab === "Instrument"){
        tableContent = <ProcInstTable onChange={value=> setSelected(value)} selected = {selected} pagination = {pagination} currentTab = {currentTab} updateData = {updateData} />
    }if(currentTab === "Reports"){
        tableContent = <ReportBoxBtns user={currentUser} downloadHistory={downloadHistory.bind(this)} downloadStatus={downloadStatus.bind(this)} downloadPI={downloadPI.bind(this)} downloadIssued={downloadIssued.bind(this)} setErrorReport={setErrorReport.bind(this)} setUploading={setUploading.bind(this)} downloadStatus3D={downloadStatus3D.bind(this)}/>
    }

    if(currentTab === "My Tray" || currentTab === "LDE/IsoControl"){
        commentBox = <div>
            <textarea placeholder="Comments" class="comments" cols="100" rows="2" required="" maxlength="400" name="comments" value={comment} onChange={handleComment}></textarea>
        </div>
    }

    if(((currentRole === "Design" || currentRole === "DesignLead") && currentTab === "Design") || 
    ((currentRole === "Stress" || currentRole === "StressLead") && currentTab === "Stress") ||
    ((currentRole === "Supports" || currentRole === "SupportsLead") && currentTab === "Supports") ||
    ((currentRole === "Materials") && currentTab === "Materials") ||
    ((currentRole === "Issuer") && currentTab === "Issuer") ||
    ((currentRole === "SpecialityLead" || currentTab ==="SpecialityLead") ||
    (currentTab=== "My Tray")) || (((currentTab === "Recycle bin" || currentTab === "On hold") && currentRole === "DesignLead") || 
    currentRole === "SpecialityLead") || (currentTab === "Process" && currentRole === "Process") ||
    (currentRole === "Instrument" && currentTab === "Instrument") ||
    (currentRole === "Design" || currentRole === "DesignLead") && currentTab === "Issued"){
        actionText = <b className="progress__text">Click an action for selected IsoFiles:</b>
        actionButtons = <ActionButtons claimClick={claim.bind(this)} verifyClick={verifyClick.bind(this)} unclaimClick={unclaim.bind(this)} transaction={transaction.bind(this)} restoreClick={restore.bind(this)} returnLead={returnLead.bind(this)} returnLeadStress={returnLeadStress.bind(this)} downloadFiles={downloadFiles.bind(this)} forceClaim={forceClaim.bind(this)} issue={issue.bind(this)} newRev={newRev.bind(this)} request={request.bind(this)} returnIso={returnIso.bind(this)} onlyDownload = {false} currentTab = {currentTab} user={currentUser} role = {currentRole}/>
    }else if(currentTab !== "History" && currentTab !== "Upload IsoFiles" && currentTab !== "Recycle bin" && currentTab !== "Reports"){
        actionText = <b className="progress__text">Click an action for selected IsoFiles:</b>
        actionButtons = <ActionButtons claimClick={claim.bind(this)} verifyClick={verifyClick.bind(this)} unclaimClick={unclaim.bind(this)} transaction={transaction.bind(this)} restoreClick={restore.bind(this)} returnLead={returnLead.bind(this)} returnLeadStress={returnLeadStress.bind(this)} downloadFiles={downloadFiles.bind(this)} forceClaim={forceClaim.bind(this)} issue={issue.bind(this)} newRev={newRev.bind(this)} request={request.bind(this)} returnIso={returnIso.bind(this)} onlyDownload = {true} currentTab = {currentTab} user={currentUser} role = {currentRole}/>
    }
    if(currentTab === "LDE/IsoControl" || currentTab === "Issued"){
        issuedBtn = <IssuedBtn onChange={value => setCurrentTab("Issued")} currentTab = {currentTab}/>
    }
    
    
    return (
        
        <body>
            
            <NavBar onChange={value => setCurrentTab(value)}/>

            <div className="isoCtrl__container">     
                <center>
                    <Collapse in={loading}>
                        <Alert style={{fontSize:"22px",position: "fixed", left: "50%", top:"10%", transform: "translate(-50%, -50%)",zIndex:"3"}} severity="info"
                            >
                            Processing...
                        </Alert>
                    </Collapse>
                    <Collapse in={errorPI}>
                        <Alert style={{fontSize:"22px",position: "fixed", left: "50%", top:"10%", transform: "translate(-50%, -50%)", zIndex:"3"}} severity="error"
                            >
                            At least one isometric was on revision and wasn't sent to LDE/Isocontrol
                        </Alert>
                    </Collapse>
                    <Collapse in={transactionSuccess}>
                        <Alert style={{fontSize:"22px",position: "fixed", left: "50%", top:"10%", transform: "translate(-50%, -50%)", zIndex:"3"}} severity="success"
                            >
                            Successful!
                        </Alert>
                    </Collapse>
                    <Collapse in={errorUnclaim}>
                        <Alert style={{fontSize:"22px",position: "fixed", left: "50%", top:"10%", transform: "translate(-50%, -50%)", zIndex:"3"}} severity="error"
                            >
                            Can't unclaim an iso assigned by LOS!
                        </Alert>
                    </Collapse>
                    <Collapse in={errorUnclaimR}>
                        <Alert style={{fontSize:"22px",position: "fixed", left: "50%", top:"10%", transform: "translate(-50%, -50%)", zIndex:"3"}} severity="error"
                            >
                            Can't unclaim a returned ISO!
                        </Alert>
                    </Collapse>
                    <Collapse in={errorReports}>
                        <Alert style={{fontSize:"22px",position: "fixed", left: "50%", top:"10%", transform: "translate(-50%, -50%)", zIndex:"3"}} severity="error"
                            >
                            Missing columns!
                        </Alert>
                    </Collapse>
                    <Collapse in={errorCL}>
                        <Alert style={{fontSize:"22px",position: "fixed", left: "50%", top:"10%", transform: "translate(-50%, -50%)", zIndex:"3"}} severity="error"
                            >
                            Missing clean!
                        </Alert>
                    </Collapse>
                    <h2 className="title__container">
                        <div className="roleSelector__container">
                            <RoleDropDown style={{paddingLeft: "2px"}} onChange={value => setCurrentRole(value)} roles = {roles}/>
                         </div>
                        <b >      
                            <i className="iso__title">IsoTracker</i>
                        </b>
                    </h2>
                    <h3 className="iso__subtitle">{currentTabText}</h3>
                </center>
                
                <div>
                    <div>
                        <div style={{display:"inline"}}>
                        <MyTrayBtn onChange={value => setCurrentTab(value)} currentTab = {currentTab}/>
                            <td className="reportBtns__container" style={{width:"380px"}}>
                                
                                <ReportBtns onChange={value => setCurrentTab(value)} currentTab = {currentTab}/>
                                
                            </td>
                            <td>
                                {uploadButton}
                            </td>   
                            <div className="stateTable__container">
                                <td style={{width: "75 %"}}>
                                    <StateTable updateData={updateData} currentRole = {currentRole} progress={progress} realProgress={realProgress} progressISO={progressISO} realProgressISO={realProgressISO}/>
                                </td>
                            </div>            

                        </div>
                    </div>
                </div>              
                
                
                <div style={{position: "relative", width:"500px"}}>
                  {pageSelector}
                  <BinBtn onChange={value => setCurrentTab("Recycle bin")} currentTab = {currentTab}/>
                  <OnHoldBtn onChange={value => setCurrentTab("On hold")} currentTab = {currentTab}/>
                  <ReportsBtn onChange={value => setCurrentTab("Reports")} currentTab = {currentTab}/>
                  {procInsBtn}
                  {issuedBtn}

                </div>
                    
                
                <div style={{height: dataTableHeight}}>
                    <br></br>
                    <br></br> 
                    {tableContent}
                </div>
                <div className="bottom__container">
                    <Collapse in={commentAlert}>
                        <Alert severity="error"
                            >
                            Add a comment before sending the isos back to design!

                            </Alert>
                    </Collapse>
                    <center className="actionBtns__container">
                        {actionText}
                        {actionButtons}
                    </center>
                    <br></br>
                    <center className="commentBox__container">
                        {commentBox}
                    </center>
                 
                    
                </div>
            </div>
            <center className="navBtns__center">              
                <NavBtns onChange={value => setCurrentTab(value)} currentTab = {currentTab} currentRole = {currentRole}/>               
            </center>
            <br></br>
        </body>

        
    );
};

export default IsoCtrl;
