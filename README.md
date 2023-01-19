# Nmap-Peek

An easy way to preview the content of an XML nmap file, in VS Code.

## Features

A simple side view of your XMl nmap file. The extensions prints all the basic information retrieved from an nmap scan. 

![nmap peek](./media/preview.png)

The status of each port, is represented with different colors. `Green` for `open`, `red` for `closed`, `light blue` for `filtered` and `gray` for `mixed responses` like closed|filtered etc. In case the ports disclose the OS of the host, a related icon will be presented. 

## Requirements

The application is using `fast-xml-parser` for parsing the XML content of nmap. 

## Known Issues

No issues at the moment

## Release Notes

### 1.0.1

Updated needed license information and missing icons.

### 1.0.0

Initial release of nmap peek.
