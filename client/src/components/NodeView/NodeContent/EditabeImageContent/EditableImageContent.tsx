import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as fa from 'react-icons/fa'
import * as ri from 'react-icons/ri'
import { fetchLinks } from '..'
import { useHistory } from 'react-router-dom'
import { INodeContentProps } from '../NodeContent'
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil'
import {
  selectedNodeState,
  selectedAnchorsState,
  selectedExtentState,
  currentNodeState,
  startAnchorState,
  refreshLinkListState,
  alertOpenState,
  alertTitleState,
  alertMessageState,
} from '../../../../global/Atoms'
import { FrontendAnchorGateway } from '../../../../anchors'
import { FrontendNodeGateway } from '../../../../nodes'
import {
  Extent,
  IAnchor,
  IImageExtent,
  INode,
  isIImageExtent,
  IImageNode,
  INodeProperty,
  makeINodeProperty,
} from '../../../../types'
import './EditableImageContent.scss'
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Flex,
  SliderFilledTrack,
  Slider,
  SliderTrack,
  SliderThumb,
  Center,
  Text,
} from '@chakra-ui/react'

interface IImageContentProps {}

/** The content of an image node, including any anchors */
export const EditableImageContent = () => {
  const startAnchor = useRecoilValue(startAnchorState)

  // recoil state management
  const currentNode = useRecoilValue(currentNodeState)
  const refreshLinkList = useRecoilValue(refreshLinkListState)
  const [selectedAnchors, setSelectedAnchors] = useRecoilState(selectedAnchorsState)
  const [selectedExtent, setSelectedExtent] = useRecoilState(selectedExtentState)
  const setSelectedNode = useSetRecoilState(selectedNodeState)
  const [currentX, setCurrentX] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const [originalX, setOriginalX] = useState(0)
  const [originalY, setOriginalY] = useState(0)
  const [percentX, setpercentX] = useState(100)
  const [percentY, setpercentY] = useState(100)
  const [containerX, setContainerX] = useState(0)
  const [containerY, setContainerY] = useState(0)
  const [flipH, setflipH] = useState(false)
  const [flipV, setflipV] = useState(false)
  const [isgray, setIsgray] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const setAlertIsOpen = useSetRecoilState(alertOpenState)
  const setAlertTitle = useSetRecoilState(alertTitleState)
  const setAlertMessage = useSetRecoilState(alertMessageState)

  const content = currentNode.content

  /* State variable to keep track of anchors rendered on image */
  const [imageAnchors, setImageAnchors] = useState<JSX.Element[]>([])
  const [startAnchorVisualization, setStartAnchorVisualization] = useState<JSX.Element>()

  let dragging: boolean = false // Indicated whether we are currently dragging the image
  let currentTop: number // To store the top of the currently selected region for onPointerMove
  let currentLeft: number // To store the left of the currently selected region for onPointerMove
  let xLast: number
  let yLast: number

  /**
   * useRef Here is an example of use ref to store a mutable html object
   * The selection ref is how we can access the selection that we render
   *
   * TODO [Editable]: This is the component that we would want to resize
   */
  const imageContainer = useRef<HTMLHeadingElement>(null)

  /* This is how we can access currently selected region for making links */
  const selection = useRef<HTMLHeadingElement>(null)

  const imgRef = useRef<HTMLImageElement>(null)

  /**
   * State variable to keep track of the currently selected anchor IDs
   * Use: Compare with selectedAnchors to update previous state
   */
  const [selectedAnchorIds, setSelectedAnchorIds] = useState<string[]>([])
  const history = useHistory()

  /**
   * Handle click on anchor that is displayed on image
   * Single click: Select the anchor
   * Double click: Navigate to the opposite node
   */
  const handleAnchorSelect = async (e: React.MouseEvent, anchor: IAnchor) => {
    e.stopPropagation()
    e.preventDefault()
    switch (e.detail) {
      // Left click to set selected anchors
      case 1:
        setSelectedAnchors && setSelectedAnchors([anchor])
        setSelectedExtent(anchor.extent)
        break
      // Double click to navigate to node
      case 2:
        const links = await fetchLinks(anchor.anchorId)
        if (links.length > 0) {
          if (links[0].anchor1Id !== anchor.anchorId) {
            history.push(`/${links[0].anchor1NodeId}/`)
            const anchor1 = await FrontendAnchorGateway.getAnchor(links[0].anchor1Id)
            if (anchor1.success && anchor1.payload) {
              setSelectedAnchors([anchor1.payload])
              setSelectedExtent(anchor1.payload.extent)
            }
          } else if (links[0].anchor2Id !== anchor.anchorId) {
            history.push(`/${links[0].anchor2NodeId}/`)
            const anchor2 = await FrontendAnchorGateway.getAnchor(links[0].anchor2Id)
            if (anchor2.success && anchor2.payload) {
              setSelectedAnchors([anchor2.payload])
              setSelectedExtent(anchor2.payload.extent)
            }
          }
        }
        break
    }
  }

  const displaySelectedAnchors = useCallback(() => {
    selectedAnchorIds.forEach((anchorId) => {
      const prevSelectedAnchor = document.getElementById(anchorId)
      if (prevSelectedAnchor) {
        prevSelectedAnchor.style.backgroundColor = ''
      }
    })
    if (imageContainer.current) {
      imageContainer.current.style.outline = ''
    }
    const newSelectedAnchorIds: string[] = []
    selectedAnchors &&
      selectedAnchors.forEach((anchor) => {
        if (anchor) {
          if (anchor.extent === null && imageContainer.current) {
            imageContainer.current.style.outline = 'solid 5px #d7ecff'
          }
          const anchorElement = document.getElementById(anchor.anchorId)
          if (anchorElement) {
            anchorElement.style.backgroundColor = '#d7ecff'
            anchorElement.style.opacity = '60%'
            newSelectedAnchorIds.push(anchorElement.id)
          }
        }
      })
    setSelectedAnchorIds(newSelectedAnchorIds)
  }, [selectedAnchorIds, selectedAnchors, startAnchor])

  /**
   * To trigger on load and when we setSelectedExtent
   */
  useEffect(() => {
    setSelectedExtent && setSelectedExtent(null)
    if (selection.current) {
      selection.current.style.left = '-50px'
      selection.current.style.top = '-50px'
      selection.current.style.width = '0px'
      selection.current.style.height = '0px'
    }
  }, [setSelectedExtent, refreshLinkList])

  useEffect(() => {
    displaySelectedAnchors()
  }, [selectedAnchors, refreshLinkList])

  useEffect(() => {
    displayImageAnchors()
  }, [selectedAnchors, currentNode, refreshLinkList, startAnchor])

  /**
   * onPointerDown initializes the selection
   * @param e
   */
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging = true
    // The y location of the image top in the browser
    const imageTop = imageContainer.current?.getBoundingClientRect().top
    // The x location of the image left in the browser
    const imageLeft = imageContainer.current?.getBoundingClientRect().left

    const x = e.clientX // The x location of the pointer in the browser
    const y = e.clientY // The y location of the poitner in the browser
    xLast = e.clientX
    yLast = e.clientY
    if (selection.current && imageLeft && imageTop) {
      selection.current.style.left = String(x - imageLeft) + 'px'
      selection.current.style.top = String(y - imageTop) + 'px'
      currentLeft = x - imageLeft
      currentTop = y - imageTop
      selection.current.style.width = '0px'
      selection.current.style.height = '0px'
    }
  }

  /**
   * onPointerMove resizes the selection
   * @param e
   */
  const onPointerMove = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (dragging) {
      const x = e.clientX // The x location of the pointer in the browser
      const y = e.clientY // The y location of the poitner in the browser
      const deltaX = x - xLast // The change in the x location
      const deltaY = y - yLast // The change in the y location
      xLast = e.clientX
      yLast = e.clientY
      if (selection.current) {
        const imageTop = imageContainer.current?.getBoundingClientRect().top
        const imageLeft = imageContainer.current?.getBoundingClientRect().left
        let left = parseFloat(selection.current.style.left)
        let top = parseFloat(selection.current.style.top)
        let width = parseFloat(selection.current.style.width)
        let height = parseFloat(selection.current.style.height)

        // TODO: You may need to change this depending on your screen resolution
        const divider = 1

        // Horizontal dragging
        // Case A: Dragging above start point
        if (imageLeft && x - imageLeft < currentLeft) {
          width -= deltaX / divider
          left += deltaX / divider
          selection.current.style.left = String(left) + 'px'
          // Case B: Dragging below start point
        } else {
          width += deltaX / divider
        }

        // Vertical dragging
        // Case A: Dragging to the left of start point
        if (imageTop && y - imageTop < currentTop) {
          height -= deltaY / divider
          top += deltaY / divider
          selection.current.style.top = String(top) + 'px'
          // Case B: Dragging to the right of start point
        } else {
          height += deltaY / divider
        }

        // Update height and width
        selection.current.style.width = String(width) + 'px'
        selection.current.style.height = String(height) + 'px'
      }
    }
  }

  /**
   * onPointerUp so we have completed making our selection,
   * therefore we should create a new IImageExtent and
   * update the currently selected extent
   * @param e
   */
  const onPointerUp = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragging = false
    if (selection.current) {
      currentTop = 0
      currentLeft = 0
      const extent: IImageExtent = {
        type: 'image',
        height: parseFloat(selection.current.style.height),
        left: parseFloat(selection.current.style.left),
        top: parseFloat(selection.current.style.top),
        width: parseFloat(selection.current.style.width),
      }
      // Check if setSelectedExtent exists, if it does then update it
      if (setSelectedExtent) {
        setSelectedExtent(extent)
      }
    }
  }

  const onHandleClearSelectionClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (setSelectedExtent) {
      setSelectedExtent(null)
      if (selection.current) {
        // Note: This is a rather hacky solution to hide the selected region
        selection.current.style.left = '-50px'
        selection.current.style.top = '-50px'
        selection.current.style.width = '0px'
        selection.current.style.height = '0px'
      }
    }
  }

  useEffect(() => {
    // this code ensures that an extent selected on one node doesn't display on another node
    setSelectedExtent(null)
    if (selection.current) {
      // Note: This is a rather hacky solution to hide the selected region
      selection.current.style.left = '-50px'
      selection.current.style.top = '-50px'
      selection.current.style.width = '0px'
      selection.current.style.height = '0px'
    }
    // this code visualizes the start anchor
    if (
      startAnchor != null &&
      startAnchor != undefined &&
      startAnchor.nodeId == currentNode.nodeId &&
      startAnchor.extent?.type == 'image'
    ) {
      setStartAnchorVisualization(
        <div
          id={'startAnchor'}
          key={'image.startAnchor'}
          className="image-anchor"
          onPointerDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          style={{
            height: startAnchor.extent?.height,
            left: startAnchor.extent.left,
            top: startAnchor.extent.top,
            width: startAnchor.extent.width,
          }}
        />
      )
    } else {
      setStartAnchorVisualization(<div></div>)
    }
  }, [currentNode, startAnchor])

  /**
   * Initialize the imageContainer and the Image
   * set height and width
   */
  useEffect(() => {
    if (imageContainer.current) {
      const node = currentNode as IImageNode
      setCurrentX(node.curX)
      setCurrentY(node.curY)
      setOriginalX(node.originX)
      setOriginalY(node.originY)
      setflipH(node.flipH)
      setflipV(node.flipV)
      setIsgray(node.isGray)
      setBrightness(node.brightness)
      const x = Math.floor((node.curX / node.curX) * 100)
      const y = Math.floor((node.curY / node.curY) * 100)
      setpercentX(x)
      setpercentY(y)
    }
    if (imgRef.current) {
      const node = currentNode as IImageNode
      imgRef.current.style.filter = 'brightness(100%)'
      imgRef.current.style.height = String(node.curY) + 'px'
      imgRef.current.style.width = String(node.curX) + 'px'
      if (node.flipH && !node.flipV) {
        imgRef.current.style.transform = 'rotateY(180deg)'
      }
      if (!node.flipH && node.flipV) {
        imgRef.current.style.transform = 'rotateX(180deg)'
      }
      if (node.flipH && node.flipV) {
        imgRef.current.style.transform = 'rotateX(180deg) rotateY(180deg)'
      }
      if (!node.flipH && !node.flipV) {
        imgRef.current.style.transform = ''
      }
      if (node.isGray) {
        imgRef.current.style.filter += ' grayscale(100%)'
      }
      imgRef.current.style.filter = 'brightness(' + String(node.brightness) + '%)'
    }
  }, [currentNode])

  /**
   * updater, update the container when curX, curY changes
   */
  useEffect(() => {
    if (imageContainer.current) {
      const node = currentNode as IImageNode
      imageContainer.current.style.height = String(currentY) + 'px'
      imageContainer.current.style.width = String(currentX) + 'px'
    }
    if (imgRef.current) {
      imgRef.current.style.height = String(currentY) + 'px'
      imgRef.current.style.width = String(currentX) + 'px'
      imgRef.current.style.filter = 'brightness(' + String(brightness) + '%)'
      if (flipH && !flipV) {
        imgRef.current.style.transform = 'rotateY(180deg)'
      }
      if (!flipH && flipV) {
        imgRef.current.style.transform = 'rotateX(180deg)'
      }
      if (flipH && flipV) {
        imgRef.current.style.transform = 'rotateX(180deg) rotateY(180deg)'
      }
      if (!flipH && !flipV) {
        imgRef.current.style.transform = ''
      }
      if (isgray) {
        imgRef.current.style.filter += ' grayscale(100%)'
      }
    }
  }, [currentX, currentY, brightness, flipH, flipV, isgray])

  /**
   * store all current values to the backend
   */
  const updateContent = async () => {
    const properties: INodeProperty[] = []
    properties.push(makeINodeProperty('originX', originalX))
    properties.push(makeINodeProperty('originY', originalY))
    properties.push(makeINodeProperty('curX', currentX))
    properties.push(makeINodeProperty('curY', currentY))
    properties.push(makeINodeProperty('flipH', flipH))
    properties.push(makeINodeProperty('flipV', flipV))
    properties.push(makeINodeProperty('brightness', brightness))
    properties.push(makeINodeProperty('isGray', isgray))

    const contentUpdateResp = await FrontendNodeGateway.updateNode(
      currentNode.nodeId,
      properties
    )
    if (!contentUpdateResp.success) {
      setAlertIsOpen(true)
      setAlertTitle('Image update failed')
      setAlertMessage(contentUpdateResp.message)
    }
    if (contentUpdateResp.success) {
      setAlertIsOpen(true)
      setAlertTitle('Successfully saved!')
      setAlertMessage(contentUpdateResp.message)
    }
  }

  /**
   * This method reset the image to its original size, including style sheets
   */
  const resetContent = () => {
    setContainerX(originalX)
    setContainerY(originalY)
    setflipH(false)
    setflipV(false)
    setIsgray(false)
    setBrightness(100)
  }

  /**
   * This method displays the existing anchors. We are fetching them from
   * the data with a call to FrontendAnchorGateway.getAnchorsByNodeId
   * which returns a list of IAnchors that are on currentNode
   */
  const displayImageAnchors = async (): Promise<void> => {
    let imageAnchors: IAnchor[]
    const anchorsFromNode = await FrontendAnchorGateway.getAnchorsByNodeId(
      currentNode.nodeId
    )
    if (anchorsFromNode.success && anchorsFromNode.payload) {
      const anchorElementList: JSX.Element[] = []
      // List of anchor elements to return
      imageAnchors = anchorsFromNode.payload
      // IAnchor array from FrontendAnchorGateway call
      imageAnchors.forEach((anchor) => {
        // Checking that the extent is of type image to access IImageExtent
        if (anchor.extent?.type == 'image') {
          if (
            !(
              startAnchor &&
              startAnchor.extent?.type == 'image' &&
              startAnchor == anchor &&
              startAnchor.nodeId == currentNode.nodeId
            )
          ) {
            anchorElementList.push(
              <div
                id={anchor.anchorId}
                key={'image.' + anchor.anchorId}
                className="image-anchor"
                onClick={(e) => {
                  handleAnchorSelect(e, anchor)
                }}
                onPointerDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                style={{
                  height: anchor.extent.height,
                  left: anchor.extent.left,
                  top: anchor.extent.top,
                  width: anchor.extent.width,
                }}
              />
            )
          }
        }
      })
      if (
        startAnchor &&
        startAnchor.extent?.type == 'image' &&
        startAnchor.nodeId == currentNode.nodeId
      ) {
        anchorElementList.push(
          <div
            id={startAnchor.anchorId}
            key={'image.startAnchor' + startAnchor.anchorId}
            className="image-startAnchor"
            style={{
              height: startAnchor.extent.height,
              left: startAnchor.extent.left,
              top: startAnchor.extent.top,
              width: startAnchor.extent.width,
            }}
          />
        )
      }
      setImageAnchors(anchorElementList)
    }
  }

  /**
   * if we are zooming the image, we should simultaneously change img and its container (X as example)
   * @param valS input value as string
   * @param value input value as number
   */
  const handleXChange = (valS: string, value: number) => {
    setCurrentX(value)
    setContainerX(value)
  }

  /**
   * percentage zooming (X as example)
   * @param val (number)
   */
  const handleXChangeBar = (val: number) => {
    setpercentX(val)
    setCurrentX((val / 100) * originalX)
    setContainerX((val / 100) * originalX)
  }
  const handleYChange = (valS: string, value: number) => {
    setCurrentY(value)
    setContainerY(value)
  }
  const handleYChangeBar = (val: number) => {
    setpercentY(val)
    setCurrentY((val / 100) * originalY)
    setContainerX((val / 100) * originalY)
  }

  const labelStyles = {
    mt: '2',
    ml: '-2.5',
    fontSize: 'sm',
  }

  return (
    <div className="imageWrapper">
      {/* <NumberInput step={5.0} value={currentX} precision={2} onChange = {handleXChange} min={0} max={2*originalX}>
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput> */}
      <div>
        <div style={{ marginBottom: '25px', fontWeight: 'bold', fontSize: '1cm' }}>
          Manage Your Image{' '}
        </div>
        <div>
          <Flex maxW="60%">
            <Center w="100px" bg="white">
              <Text style={{ fontFamily: 'Futura' }}>Width</Text>
            </Center>
            <NumberInput
              maxW="200px"
              mr="2rem"
              step={5.0}
              value={currentX}
              precision={2}
              onChange={handleXChange}
              min={0}
              max={2 * originalX}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Slider
              flex="1"
              focusThumbOnChange={false}
              value={percentX}
              max={200}
              colorScheme="red"
              onChange={handleXChangeBar}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb fontSize="sm" boxSize="32px">
                {percentX}
              </SliderThumb>
            </Slider>
          </Flex>
        </div>
      </div>

      <div>
        <Flex maxW="60%">
          <Center w="100px" bg="white">
            <Text style={{ fontFamily: 'Futura' }}>Height</Text>
          </Center>
          <NumberInput
            maxW="200px"
            mr="2rem"
            step={5.0}
            value={currentY}
            precision={2}
            onChange={handleYChange}
            min={0}
            max={2 * originalY}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <Slider
            flex="1"
            focusThumbOnChange={false}
            value={percentY}
            max={200}
            colorScheme="blue"
            onChange={handleYChangeBar}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb fontSize="sm" boxSize="32px">
              {percentY}
            </SliderThumb>
          </Slider>
        </Flex>
      </div>

      <div>
        <Flex maxW="60%">
          <Center w="100px" bg="white">
            <Text style={{ fontFamily: 'Futura' }}>Brightness</Text>
          </Center>
          <Slider
            flex="1"
            focusThumbOnChange={false}
            value={brightness}
            max={200}
            colorScheme="green"
            onChange={(val) => {
              setBrightness(val)
            }}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb fontSize="sm" boxSize="32px">
              {brightness}
            </SliderThumb>
          </Slider>
        </Flex>
      </div>

      <div>
        <button
          onClick={(e) => {
            setflipH(!flipH)
          }}
          className={'textEditorButton imgbutton bold'}
        >
          Horizontal Flip
        </button>
        <button
          onClick={(e) => {
            setflipV(!flipV)
          }}
          className={'textEditorButton imgbutton italic'}
        >
          Vertical Flip
        </button>
        <button
          onClick={(e) => {
            setIsgray(!isgray)
          }}
          className={'textEditorButton imgbutton gray'}
        >
          Try Gray
        </button>
        <button onClick={resetContent} className={'textEditorButton imgbutton redo'}>
          Reset
        </button>
      </div>

      <div
        ref={imageContainer}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
        className="imageContent-wrapper"
      >
        {startAnchorVisualization}
        {imageAnchors}
        {
          <div className="selection" ref={selection}>
            <div
              onClick={onHandleClearSelectionClick}
              onPointerDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              className="selection-close"
            >
              <fa.FaTimes />
            </div>
          </div>
        }
        <img src={content} ref={imgRef} />
      </div>

      <div style={{ verticalAlign: 'middle' }}>
        <div style={{ display: 'inline', fontWeight: 'bold', fontSize: '20px' }}>
          Do not forget to save your image!
        </div>
        <button onClick={updateContent} className={'textEditorButton imgbutton save'}>
          Save
        </button>
      </div>
    </div>
  )
}
