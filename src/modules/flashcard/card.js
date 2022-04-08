/* eslint-disable no-console */
/** @jsx jsx */
import React, {Children, useEffect} from 'react';
import {jsx, Flex, Text, Box} from 'theme-ui';
import {useConnect, useAccount, useProvider} from 'wagmi';
import {Button} from '@modules/ui';
import {motion} from 'framer-motion';
import {Connector} from '@src/course/connect';
import {Modal} from '../modal';
import {isRegistered} from '../../course/course';

const Card = ({
  index,
  answerCallback,
  revealCallback,
  isActive,
  wasActive,
  isRevealed,
  children,
  currentCard,
  ...otherProps
}) => {
  const _children = Children.toArray(children);

  const cardVariants = {
    initial: {y: 10 * (index - currentCard), opacity: 1},
    active: {y: 0, opacity: 1},
    exit: {y: -64, opacity: 0, scale: 1.1}
  };

  const [{data, error}, connect] = useConnect();
  const [{data: accountData}] = useAccount();
  const [isUserRegistered, setIsUserRegistered] = React.useState(false);
  const provider = useProvider();

  const [isModalVisible, setModalVisible] = React.useState(false);

  useEffect(() => {
    async function get() {
      setIsUserRegistered(await isRegistered(accountData.address, provider));
    }
    if (accountData?.address && provider) {
      get();
    }
  }, [accountData?.address, provider]);

  if (_children.length < 2) {
    return (
      <Flex
        sx={{
          width: '343px',
          height: '439px',
          borderRadius: 7,
          bg: 'error',
          color: 'onBackgroundAlt',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
        }}
      >
        <Flex
          sx={{
            p: 3,
            fontSize: 5,
            alignItems: 'center',
            textAlign: 'center',
            justifyContent: 'center',
            flex: '1 1 auto'
          }}
        >
          ERROR! Incorrect # of Children for Card. Please check your mdx.
        </Flex>
      </Flex>
    );
  }

  const revealCopyVariant = {
    revealed: {opacity: 0, y: 12, transition: {duration: 0.2}},
    initial: {opacity: 1, y: 0, transition: {duration: 0.2}}
  };

  const answerCopyVariant = {
    revealed: {y: 0},
    initial: {y: 48}
  };

  const postAnswerVariant = {
    revealed: {opacity: 1},
    initial: {opacity: 0}
  };

  const question = _children[0];

  const answer = _children[1];

  const postAnswer = _children.slice(2, _children.length);
  const currentVariant = isActive ? 'active' : wasActive ? 'exit' : 'initial';
  const inactiveScale = 1 - 0.05 * (index - currentCard);

  const handleOnClickMetamask = () => {
    connect(data.connectors[Connector.INJECTED]).then((result) => {
      if (!result.error) {
        setModalVisible(true);
      }
    });
  };

  return (
    <motion.div variants={cardVariants} animate={currentVariant}>
      <Modal
        setModalVisible={setModalVisible}
        isModalVisible={isModalVisible}
      />
      <Flex
        sx={{
          width: ['100%', '343px', '343px'],
          height: ['58vh', '439px', '439px'],
          borderRadius: 7,
          bg: 'backgroundAlt',
          color: 'onBackgroundAlt',
          display: index - currentCard > 2 ? 'none' : 'flex',
          opacity: inactiveScale,
          flexDirection: 'column',
          overflow: 'hidden',
          transform: `scale(${isActive ? '1' : inactiveScale})`,
          transformOrigin: 'bottom',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
        }}
      >
        {isActive && (
          <>
            <Flex
              sx={{
                alignItems: 'center',
                textAlign: 'center',
                justifyContent: 'center',
                flex: '1 1 auto',
                p: [1, 2, 3],
                fontSize: [2, 3, 4]
              }}
            >
              {question}
            </Flex>
            <Flex
              sx={{
                height: '38%',
                bg: 'primaryMuted',
                borderTop: '1px solid',
                borderColor: 'background',
                position: 'relative',
                color: 'text',
                px: 2,
                pt: '20px',
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexDirection: 'column',
                '&:hover .reveal-answer': {
                  transition: 'all .2s ease',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <div
                sx={{
                  position: 'absolute',
                  boxShadow: '0px 0 10px rgba(0,0,0,0.3)',
                  top: '-13px',
                  height: '13px',
                  width: '100%'
                }}
              ></div>
              <motion.div
                variants={revealCopyVariant}
                initial="initial"
                animate={isRevealed ? 'revealed' : 'initial'}
                sx={{position: 'absolute'}}
              >
                {data.connected && isUserRegistered && (
                  <Flex onClick={revealCallback}>
                    <span
                      className="reveal-answer"
                      sx={{
                        fontSize: [3, 4, 4],
                        mb: 2,
                        fontWeight: 'bold',
                        transform: 'scale(1)',
                        transition: 'all .2s ease'
                      }}
                    >
                      {' '}
                      Reveal the Answer
                    </span>
                  </Flex>
                )}
                {!data.connected && (
                  <>
                    <div>
                      <>
                        <Box
                          sx={{
                            padding: '0.5rem'
                          }}
                        >
                          <Text
                            sx={{
                              textAlign: 'center',
                              fontWeight: 'bold',
                              marginX: 'auto'
                            }}
                          >
                            Connect wallet to reveal
                          </Text>
                        </Box>

                        <Button
                          sx={{marginX: 'auto'}}
                          disabled={!data.connectors[Connector.INJECTED].ready}
                          onClick={handleOnClickMetamask}
                        >
                          Metamask
                        </Button>
                      </>
                      {error && (
                        <div>{error?.message ?? 'Failed to connect'}</div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
              {data.connected && !isUserRegistered && (
                <>
                  <div>
                    <>
                      <Box
                        sx={{
                          padding: '0.5rem'
                        }}
                      >
                        <Text
                          sx={{
                            textAlign: 'center',
                            fontWeight: 'bold',
                            marginX: 'auto'
                          }}
                        >
                          Register to reveal
                        </Text>
                      </Box>

                      <Button
                        sx={{marginX: 'auto'}}
                        disabled={!data.connectors[Connector.INJECTED].ready}
                        onClick={() => setModalVisible(true)}
                      >
                        Register
                      </Button>
                    </>
                  </div>
                </>
              )}
              {/* Reveal answer when Wallet is Connected and User is Registered */}
              {data.connected && isUserRegistered && (
                <motion.div
                  variants={answerCopyVariant}
                  initial="initial"
                  animate={isRevealed ? 'revealed' : 'initial'}
                  sx={{
                    overflow: 'auto',
                    '& > *:first-child': {
                      fontSize: [3, 4, 4],
                      textAlign: 'center',
                      fontWeight: 'bold',
                      opacity: isRevealed ? 0.8 : 1,
                      filter: isRevealed ? 'blur(0px)' : 'blur(4px)',
                      transition: 'all .2s ease'
                    }
                  }}
                >
                  {answer}
                  {_children.length > 2 && (
                    <motion.div
                      sx={{fontSize: '12px', mt: 2}}
                      variants={postAnswerVariant}
                      initial="initial"
                      animate={isRevealed ? 'revealed' : 'initial'}
                    >
                      {postAnswer}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </Flex>
          </>
        )}
      </Flex>
    </motion.div>
  );
};

export default Card;
