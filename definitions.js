var PROTOCOL_PORTS = {
    ftp:21,
    ssh:22,
    scp:22,
    sftp:22,
    telnet:23,
    smtp:25,
    whois:43,
    dns:53,
    https:443,
    http:80,
    bootp:68,
    tftp:69,
    kerberos:88,
    ftps:990,
    rdp:3389
}

var PROTOCOL_SPELLINGS = {
    ftp:"FTP",
    ssh:"SSH",
    scp:"SCP",
    sftp:"SFTP",
    telnet:"Telnet",
    smtp:"SMTP",
    whois:"WHOIS",
    dns:"DNS",
    https:"HTTPS",
    http:"HTTP",
    bootp:"BOOTP",
    tftp:"TFTP",
    kerberos:"Kerberos",
    ftps:"FTPS",
    rdp:"RDP"
}

function spellOut(prot) {
    return "<say-as interpret-as='spell-out'>" + prot + "</say-as>";
}

var PROTOCOL_SSML = {
    ftp:spellOut("FTP"),
    ssh:spellOut("SSH"),
    scp:spellOut("SCP"),
    sftp:spellOut("SFTP"),
    telnet:"Telnet",
    smtp:spellOut("SMTP"),
    whois:"<phoneme alphabet='ipa' ph='huɪz'>WHOIS</phoneme>",
    dns:spellOut("DNS"),
    https:spellOut("HTTPS"),
    http:spellOut("HTTP"),
    bootp:"<phoneme alphabet='ipa' ph='butˈpi'>BOOTP</phoneme>",
    tftp:spellOut("TFTP"),
    kerberos:"Kerberos",
    ftps:spellOut("FTPS"),
    rdp:spellOut("RDP")
}

var exports = module.exports = {
    ssml: PROTOCOL_SSML,
    spellings: PROTOCOL_SPELLINGS,
    ports: PROTOCOL_PORTS
}
